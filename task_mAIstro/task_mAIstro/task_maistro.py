import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from trustcall import create_extractor

from typing import Literal, Optional, TypedDict

from langchain_core.runnables import RunnableConfig
from langchain_core.messages import merge_message_runs
from langchain_core.messages import SystemMessage, HumanMessage

from langchain_openai import ChatOpenAI

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore

import configuration
from gmail_tools import GMAIL_TOOLS
from voice_commands import process_voice_command

import os
from dotenv import load_dotenv
load_dotenv()

## Utilities 

# Inspect the tool calls for Trustcall
class Spy:
    def __init__(self):
        self.called_tools = []

    def __call__(self, run):
        q = [run]
        while q:
            r = q.pop()
            if r.child_runs:
                q.extend(r.child_runs)
            if r.run_type == "chat_model":
                self.called_tools.append(
                    r.outputs["generations"][0][0]["message"]["kwargs"]["tool_calls"]
                )

# Extract information from tool calls for both patches and new memories in Trustcall
def extract_tool_info(tool_calls, schema_name="Memory"):
    """Extract information from tool calls for both patches and new memories.
    
    Args:
        tool_calls: List of tool calls from the model
        schema_name: Name of the schema tool (e.g., "Memory", "ToDo", "Profile")
    """
    # Initialize list of changes
    changes = []
    
    for call_group in tool_calls:
        for call in call_group:
            if call['name'] == 'PatchDoc':
                # Check if there are any patches
                if call['args']['patches']:
                    changes.append({
                        'type': 'update',
                        'doc_id': call['args']['json_doc_id'],
                        'planned_edits': call['args']['planned_edits'],
                        'value': call['args']['patches'][0]['value']
                    })
                else:
                    # Handle case where no changes were needed
                    changes.append({
                        'type': 'no_update',
                        'doc_id': call['args']['json_doc_id'],
                        'planned_edits': call['args']['planned_edits']
                    })
            elif call['name'] == schema_name:
                changes.append({
                    'type': 'new',
                    'value': call['args']
                })

    # Format results as a single string
    result_parts = []
    for change in changes:
        if change['type'] == 'update':
            result_parts.append(
                f"Document {change['doc_id']} updated:\n"
                f"Plan: {change['planned_edits']}\n"
                f"Added content: {change['value']}"
            )
        elif change['type'] == 'no_update':
            result_parts.append(
                f"Document {change['doc_id']} unchanged:\n"
                f"{change['planned_edits']}"
            )
        else:
            result_parts.append(
                f"New {schema_name} created:\n"
                f"Content: {change['value']}"
            )
    
    return "\n\n".join(result_parts)

## Schema definitions

# User profile schema
class Profile(BaseModel):
    """This is the profile of the user you are chatting with"""
    name: Optional[str] = Field(description="The user's name", default=None)
    location: Optional[str] = Field(description="The user's location", default=None)
    job: Optional[str] = Field(description="The user's job", default=None)
    connections: list[str] = Field(
        description="Personal connection of the user, such as family members, friends, or coworkers",
        default_factory=list
    )
    interests: list[str] = Field(
        description="Interests that the user has", 
        default_factory=list
    )

# ToDo schema
class ToDo(BaseModel):
    task: str = Field(description="The task to be completed.")
    time_to_complete: Optional[int] = Field(description="Estimated time to complete the task (minutes).")
    deadline: Optional[datetime] = Field(
        description="When the task needs to be completed by (if applicable)",
        default=None
    )
    solutions: list[str] = Field(
        description="List of specific, actionable solutions (e.g., specific ideas, service providers, or concrete options relevant to completing the task)",
        min_items=1,
        default_factory=list
    )
    status: Literal["not started", "in progress", "done", "archived"] = Field(
        description="Current status of the task",
        default="not started"
    )
    
class EmailDraft(BaseModel):
    """Email draft to be composed and sent"""
    recipient: str = Field(description="Email recipient name or address")
    subject: Optional[str] = Field(description="Email subject line", default=None)
    body: str = Field(description="Email content/body text")
    email_type: Literal["reply", "new", "forward"] = Field(default="reply")
    reference_context: Optional[str] = Field(description="Context about the original email or conversation", default=None)
    status: Literal["draft", "ready_to_send", "sent"] = Field(default="draft")
    created_date: datetime = Field(default_factory=datetime.now)

## Initialize the model and tools

# Update memory tool
class UpdateMemory(TypedDict):
    """ Decision on what memory type to update. Use only when specifically needed to update user info, todos, or handle emails. """
    update_type: Literal['user', 'todo', 'instructions', 'email', 'gmail']

# Initialize the model with Gmail tools and voice commands
model = ChatOpenAI(model="gpt-4o", temperature=0)
model_with_tools = model.bind_tools(GMAIL_TOOLS + [UpdateMemory, process_voice_command], parallel_tool_calls=False)

## Create the Trustcall extractors for updating the user profile and ToDo list
profile_extractor = create_extractor(
    model,
    tools=[Profile],
    tool_choice="Profile",
)

## Prompts 

# Chatbot instruction for choosing what to update and what tools to call 
MODEL_SYSTEM_MESSAGE = """{task_maistro_role} 

You have a long term memory which keeps track of four things:
1. The user's profile (general information about them) 
2. The user's ToDo list
3. General instructions for updating the ToDo list
4. Email drafts and composition requests

Here is the current User Profile (may be empty if no information has been collected yet):
<user_profile>
{user_profile}
</user_profile>

Here is the current ToDo List (may be empty if no tasks have been added yet):
<todo>
{todo}
</todo>

Here are current Email Drafts (may be empty if no emails have been drafted yet):
<emails>
{emails}
</emails>

Here are the current user-specified preferences for updating the ToDo list (may be empty if no preferences have been specified yet):
<instructions>
{instructions}
</instructions>

Here are your instructions for reasoning about the user's messages:

1. Reason carefully about the user's messages as presented below.

2. First, check if the user is asking for Gmail functionality:
- Use the appropriate Gmail tools for email operations (reading, sending, searching, archiving, etc.)
- Gmail tools are available for: sending emails, reading messages, searching, managing threads, labels, and all email operations
- Always check Gmail service status first if Gmail operations fail

3. Decide whether any of your long-term memory should be updated:
- If personal information was provided about the user, update the user's profile by calling UpdateMemory tool with type `user`
- If tasks are mentioned, update the ToDo list by calling UpdateMemory tool with type `todo`
- If the user has specified preferences for how to update the ToDo list, update the instructions by calling UpdateMemory tool with type `instructions`
- If email composition, replies, or email-related requests are mentioned, update emails by calling UpdateMemory tool with type `email`
- If Gmail operations were performed, update memory with type `gmail`

4. Tell the user that you have updated your memory, if appropriate:
- Do not tell the user you have updated the user's profile
- Tell the user when you update the todo list
- Do not tell the user that you have updated instructions
- Tell the user when you create or update email drafts
- Summarize Gmail operations performed

5. For email requests, be specific about what email content was captured and ask for clarification on recipient details if needed.

6. For simple greetings, questions, or general conversation, respond directly without using tools.

7. Only use tools when specifically needed:
   - UpdateMemory tool only when you need to save important user information, tasks, or emails
   - Gmail tools only when user asks for specific email operations
   - process_voice_command only for voice-specific requests

8. Respond naturally and conversationally, especially for voice interactions."""

# Trustcall instruction
TRUSTCALL_INSTRUCTION = """Reflect on following interaction. 

Use the provided tools to retain any necessary memories about the user. 

Use parallel tool calling to handle updates and insertions simultaneously.

System Time: {time}"""

# Instructions for updating the ToDo list
CREATE_INSTRUCTIONS = """Reflect on the following interaction.

Based on this interaction, update your instructions for how to update ToDo list items. Use any feedback from the user to update how they like to have items added, etc.

Your current instructions are:

<current_instructions>
{current_instructions}
</current_instructions>"""

## Node definitions

def task_mAIstro(state: MessagesState, config: RunnableConfig, store: BaseStore):
    
    """Load memories from the store and use them to personalize the chatbot's response."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category
    task_maistro_role = configurable.task_maistro_role

    # Retrieve profile memory from the store
    namespace = ("profile", todo_category, user_id)
    memories = store.search(namespace)
    if memories:
        user_profile = memories[0].value
    else:
        user_profile = None

    # Retrieve todo memory from the store
    namespace = ("todo", todo_category, user_id)
    memories = store.search(namespace)
    todo = "\n".join(f"{mem.value}" for mem in memories)

    # Retrieve email drafts from the store
    namespace = ("emails", todo_category, user_id)
    memories = store.search(namespace)
    emails = "\n".join(f"{mem.value}" for mem in memories)

    # Retrieve custom instructions
    namespace = ("instructions", todo_category, user_id)
    memories = store.search(namespace)
    if memories:
        instructions = memories[0].value
    else:
        instructions = ""
    
    system_msg = MODEL_SYSTEM_MESSAGE.format(
        task_maistro_role=task_maistro_role, 
        user_profile=user_profile, 
        todo=todo, 
        emails=emails,
        instructions=instructions
    )

    # Respond using memory as well as the chat history, with Gmail tools and voice commands available
    response = model_with_tools.invoke([SystemMessage(content=system_msg)]+state["messages"])

    return {"messages": [response]}

def update_profile(state: MessagesState, config: RunnableConfig, store: BaseStore):

    """Reflect on the chat history and update the memory collection."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category

    # Define the namespace for the memories
    namespace = ("profile", todo_category, user_id)

    # Retrieve the most recent memories for context
    existing_items = store.search(namespace)

    # Format the existing memories for the Trustcall extractor
    tool_name = "Profile"
    existing_memories = ([(existing_item.key, tool_name, existing_item.value)
                          for existing_item in existing_items]
                          if existing_items
                          else None
                        )

    # Merge the chat history and the instruction
    TRUSTCALL_INSTRUCTION_FORMATTED=TRUSTCALL_INSTRUCTION.format(time=datetime.now().isoformat())
    updated_messages=list(merge_message_runs(messages=[SystemMessage(content=TRUSTCALL_INSTRUCTION_FORMATTED)] + state["messages"][:-1]))

    # Invoke the extractor
    result = profile_extractor.invoke({"messages": updated_messages, 
                                         "existing": existing_memories})

    # Save save the memories from Trustcall to the store
    for r, rmeta in zip(result["responses"], result["response_metadata"]):
        store.put(namespace,
                  rmeta.get("json_doc_id", str(uuid.uuid4())),
                  r.model_dump(mode="json"),
            )
    tool_calls = state['messages'][-1].tool_calls
    # Return tool message with update verification
    return {"messages": [{"role": "tool", "content": "updated profile", "tool_call_id":tool_calls[0]['id']}]}

def update_todos(state: MessagesState, config: RunnableConfig, store: BaseStore):

    """Reflect on the chat history and update the memory collection."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category

    # Define the namespace for the memories
    namespace = ("todo", todo_category, user_id)

    # Retrieve the most recent memories for context
    existing_items = store.search(namespace)

    # Format the existing memories for the Trustcall extractor
    tool_name = "ToDo"
    existing_memories = ([(existing_item.key, tool_name, existing_item.value)
                          for existing_item in existing_items]
                          if existing_items
                          else None
                        )

    # Merge the chat history and the instruction
    TRUSTCALL_INSTRUCTION_FORMATTED=TRUSTCALL_INSTRUCTION.format(time=datetime.now().isoformat())
    updated_messages=list(merge_message_runs(messages=[SystemMessage(content=TRUSTCALL_INSTRUCTION_FORMATTED)] + state["messages"][:-1]))

    # Initialize the spy for visibility into the tool calls made by Trustcall
    spy = Spy()
    
    # Create the Trustcall extractor for updating the ToDo list 
    todo_extractor = create_extractor(
    model,
    tools=[ToDo],
    tool_choice=tool_name,
    enable_inserts=True
    ).with_listeners(on_end=spy)

    # Invoke the extractor
    result = todo_extractor.invoke({"messages": updated_messages, 
                                         "existing": existing_memories})

    # Save save the memories from Trustcall to the store
    for r, rmeta in zip(result["responses"], result["response_metadata"]):
        store.put(namespace,
                  rmeta.get("json_doc_id", str(uuid.uuid4())),
                  r.model_dump(mode="json"),
            )
        
    # Respond to the tool call made in task_mAIstro, confirming the update    
    tool_calls = state['messages'][-1].tool_calls

    # Extract the changes made by Trustcall and add the the ToolMessage returned to task_mAIstro
    todo_update_msg = extract_tool_info(spy.called_tools, tool_name)
    return {"messages": [{"role": "tool", "content": todo_update_msg, "tool_call_id":tool_calls[0]['id']}]}

def update_instructions(state: MessagesState, config: RunnableConfig, store: BaseStore):

    """Reflect on the chat history and update the memory collection."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category
    
    namespace = ("instructions", todo_category, user_id)

    existing_memory = store.get(namespace, "user_instructions")
        
    # Format the memory in the system prompt
    system_msg = CREATE_INSTRUCTIONS.format(current_instructions=existing_memory.value if existing_memory else None)
    new_memory = model.invoke([SystemMessage(content=system_msg)]+state['messages'][:-1] + [HumanMessage(content="Please update the instructions based on the conversation")])

    # Overwrite the existing memory in the store 
    key = "user_instructions"
    store.put(namespace, key, {"memory": new_memory.content})
    tool_calls = state['messages'][-1].tool_calls
    # Return tool message with update verification
    return {"messages": [{"role": "tool", "content": "updated instructions", "tool_call_id":tool_calls[0]['id']}]}

def update_emails(state: MessagesState, config: RunnableConfig, store: BaseStore):
    """Reflect on the chat history and update email drafts."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category

    # Define the namespace for email memories
    namespace = ("emails", todo_category, user_id)

    # Retrieve the most recent email drafts for context
    existing_items = store.search(namespace)

    # Format the existing memories for the Trustcall extractor
    tool_name = "EmailDraft"
    existing_memories = ([(existing_item.key, tool_name, existing_item.value)
                          for existing_item in existing_items]
                          if existing_items
                          else None)

    # Merge the chat history and the instruction
    TRUSTCALL_INSTRUCTION_FORMATTED = TRUSTCALL_INSTRUCTION.format(time=datetime.now().isoformat())
    updated_messages = list(merge_message_runs(messages=[SystemMessage(content=TRUSTCALL_INSTRUCTION_FORMATTED)] + state["messages"][:-1]))

    # Initialize the spy for visibility into the tool calls made by Trustcall
    spy = Spy()
    
    # Create the Trustcall extractor for updating email drafts
    email_extractor = create_extractor(
        model,
        tools=[EmailDraft],
        tool_choice=tool_name,
        enable_inserts=True
    ).with_listeners(on_end=spy)

    # Invoke the extractor
    result = email_extractor.invoke({
        "messages": updated_messages, 
        "existing": existing_memories
    })

    # Save the email drafts from Trustcall to the store
    for r, rmeta in zip(result["responses"], result["response_metadata"]):
        store.put(namespace,
                  rmeta.get("json_doc_id", str(uuid.uuid4())),
                  r.model_dump(mode="json"))
        
    # Respond to the tool call made in task_mAIstro, confirming the update    
    tool_calls = state['messages'][-1].tool_calls

    # Extract the changes made by Trustcall and add to the ToolMessage returned to task_mAIstro
    email_update_msg = extract_tool_info(spy.called_tools, tool_name)
    return {"messages": [{"role": "tool", "content": email_update_msg, "tool_call_id": tool_calls[0]['id']}]}

def handle_gmail(state: MessagesState, config: RunnableConfig, store: BaseStore):
    """Handle Gmail operations and log to memory."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    user_id = configurable.user_id
    todo_category = configurable.todo_category

    # Define the namespace for Gmail operation memories (sanitize user_id for LangGraph store)
    sanitized_user_id = user_id.replace("@", "_at_").replace(".", "_")
    namespace = ("gmail_operations", todo_category, sanitized_user_id)

    # Find the AI message with tool calls (should be the last AIMessage before any tool responses)
    ai_message_with_tools = None
    for message in reversed(state['messages']):
        if hasattr(message, 'tool_calls') and getattr(message, 'tool_calls', []):
            ai_message_with_tools = message
            break
    
    if not ai_message_with_tools:
        return {"messages": []}
    
    # Extract Gmail operations and execute them
    gmail_operations = []
    gmail_tool_names = [tool.name for tool in GMAIL_TOOLS]  # Use .name instead of .__name__
    tool_responses = []
    
    for tool_call in ai_message_with_tools.tool_calls:
        if tool_call['name'] in gmail_tool_names:
            gmail_operations.append({
                "operation": tool_call['name'],
                "args": tool_call['args'],
                "timestamp": datetime.now().isoformat()
            })
            
            # Execute the Gmail tool and generate response
            for tool in GMAIL_TOOLS:
                if tool.name == tool_call['name']:
                    try:
                        # Pass configuration to Gmail tools
                        args = tool_call['args'].copy()
                        args['config'] = config.get("configurable", {})
                        
                        result = tool.func(**args)
                        tool_responses.append({
                            "role": "tool",
                            "content": str(result),
                            "tool_call_id": tool_call['id']
                        })
                    except Exception as e:
                        tool_responses.append({
                            "role": "tool", 
                            "content": f"Error executing {tool_call['name']}: {str(e)}",
                            "tool_call_id": tool_call['id']
                        })
                    break
    
    # Store Gmail operations in memory
    if gmail_operations:
        operation_summary = f"Gmail operations performed: {', '.join([op['operation'] for op in gmail_operations])}"
        store.put(namespace, 
                  str(uuid.uuid4()), 
                  {
                      "operations": gmail_operations,
                      "summary": operation_summary,
                      "timestamp": datetime.now().isoformat()
                  })
    
    return {"messages": tool_responses}

# Conditional edge
def route_message(state: MessagesState, config: RunnableConfig, store: BaseStore) -> Literal["__end__", "update_todos", "update_instructions", "update_profile", "update_emails", "handle_gmail"]:
    """Reflect on the memories and chat history to decide whether to update the memory collection."""
    message = state['messages'][-1]
    if len(message.tool_calls) == 0:
        return END
    else:
        tool_call = message.tool_calls[0]
        tool_name = tool_call.get('name', '')
        
        # Handle Gmail tools directly
        if tool_name in ['list_gmail_messages', 'get_gmail_message', 'send_gmail_message', 'search_gmail', 'archive_gmail_message', 'delete_gmail_message', 'create_gmail_label', 'add_gmail_label', 'remove_gmail_label', 'mark_gmail_as_read', 'mark_gmail_as_unread', 'read_gmail_message', 'reply_to_gmail', 'check_gmail_service_status']:
            return "handle_gmail"
        
        # Handle UpdateMemory tool calls
        if tool_name == 'UpdateMemory':
            update_type = tool_call.get('args', {}).get('update_type')
            if not update_type:
                return END
            
            if update_type == "user":
                return "update_profile"
            elif update_type == "todo":
                return "update_todos"
            elif update_type == "instructions":
                return "update_instructions"
            elif update_type == "email":
                return "update_emails"
            elif update_type == "gmail":
                return "handle_gmail"
            else:
                return END
        
        # Handle other tools (like process_voice_command)
        return END

# Create the graph + all nodes
builder = StateGraph(MessagesState, config_schema=configuration.Configuration)

# Define the flow of the memory extraction process
builder.add_node(task_mAIstro)
builder.add_node(update_todos)
builder.add_node(update_profile)
builder.add_node(update_instructions)
builder.add_node("update_emails", update_emails)
builder.add_node("handle_gmail", handle_gmail)

# Define the flow 
builder.add_edge(START, "task_mAIstro")
builder.add_conditional_edges("task_mAIstro", route_message)
builder.add_edge("update_todos", "task_mAIstro")
builder.add_edge("update_profile", "task_mAIstro")
builder.add_edge("update_instructions", "task_mAIstro")
builder.add_edge("update_emails", "task_mAIstro")
builder.add_edge("handle_gmail", "task_mAIstro")

# Export the builder so the server can compile it with store and checkpointer
# Don't compile here, let the server do it