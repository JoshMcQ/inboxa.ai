import json
import logging
import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from trustcall import create_extractor

from typing import Literal, Optional, TypedDict

from langchain_core.runnables import RunnableConfig
from langchain_core.messages import merge_message_runs
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

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

logger = logging.getLogger(__name__)

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

# Initialize the model with Gmail tools and voice commands (fast default, overridable via env)
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
try:
    model = ChatOpenAI(model=MODEL_NAME, temperature=0)
except Exception:
    # Fallback if the specified model isn't available
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
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
- If `hints` are provided in config (e.g., `sender_hint`, `after_date`, `before_date`), prefer precise searches using those windows:
  - Use `search_gmail_by_sender_today`/`search_gmail_by_sender_on_date` when applicable, or build an exact `after:YYYY/MM/DD before:YYYY/MM/DD` query with `from:sender_hint`.
  - If no results, try a quoted keyword search using the hint within the same date window.
- Prefer `search_gmail_smart` for ambiguous queries without hints; fall back to `search_gmail` with precise operators.
- NEVER call `send_gmail` unless the user explicitly asks to send an email. For queries like "find", "read", "summarize", or "what was the email", do not attempt to send or draft.
- When time expressions appear (e.g. "yesterday", "today", "last week"), convert them to Gmail date operators using the user's timezone. For example, for "yesterday" use an exact window with `after:YYYY/MM/DD before:YYYY/MM/DD`.
- After listing search results, ALWAYS call `read_gmail_message(<Message ID>)` on the top matching result to extract full content and headers (including date).
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

8. Respond naturally and conversationally, especially for voice interactions.
9. For voice responses, keep the spoken content concise (aim < 1200 characters). Prefer a clear summary with the key fields (From, Subject, Date) and a short digest of the body. Offer to "read the full email" if the user wants the entire content.
"""

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

## Helper functions

def clean_message_history(messages):
    """Clean and deduplicate message history to prevent API errors"""
    if not messages:
        return []

    cleaned = []
    seen_content = set()
    tool_call_tracker = {}  # Track which tool calls have been executed

    for msg in messages:
        msg_type = getattr(msg, 'type', None)
        msg_content = getattr(msg, 'content', '')

        # Special handling for AI messages with tool calls
        if msg_type == 'ai' and hasattr(msg, 'tool_calls') and getattr(msg, 'tool_calls', None):
            # Create a hash based on tool calls, not just content
            tool_calls_str = str([(tc.get('name', ''), tc.get('args', {})) for tc in msg.tool_calls])
            content_hash = f"{msg_type}:tool_calls:{tool_calls_str}"
        else:
            # Create a content hash for deduplication
            content_hash = f"{msg_type}:{str(msg_content)[:100]}"

        # Skip duplicate messages
        if content_hash in seen_content:
            continue

        seen_content.add(content_hash)

        # For AI messages with tool calls, track which calls have been made
        if msg_type == 'ai' and hasattr(msg, 'tool_calls') and getattr(msg, 'tool_calls', None):
            for tc in msg.tool_calls:
                tc_id = tc.get('id') if isinstance(tc, dict) else getattr(tc, 'id', None)
                if tc_id:
                    tool_call_tracker[tc_id] = tc

        # For tool messages, ensure they have proper preceding AI messages with tool_calls
        if msg_type == 'tool':
            tool_call_id = getattr(msg, 'tool_call_id', None)

            # Check if this tool call ID exists in our tracker
            if tool_call_id not in tool_call_tracker:
                continue  # Skip orphaned tool messages

        cleaned.append(msg)

    return cleaned

def get_tool_call_id(state, update_type='UpdateMemory'):
    """Helper function to safely extract tool_call_id from message state"""
    last_msg = state['messages'][-1]
    tool_call_id = None

    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
        for tool_call in last_msg.tool_calls:
            # Handle dict-style tool_call
            if isinstance(tool_call, dict):
                if tool_call.get('name') == update_type:
                    tool_call_id = tool_call.get('id')
                    break
            # Handle object-style tool_call
            elif hasattr(tool_call, 'name') and getattr(tool_call, 'name') == update_type:
                tool_call_id = getattr(tool_call, 'id', None)
                break

    return tool_call_id

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

    # Clean message history to prevent API errors
    cleaned_messages = clean_message_history(state["messages"])

    # Respond using memory as well as the cleaned chat history, with Gmail tools and voice commands available
    response = model_with_tools.invoke([SystemMessage(content=system_msg)]+cleaned_messages)

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
    # Find the tool call that triggered this update
    tool_call_id = get_tool_call_id(state, 'UpdateMemory')

    if not tool_call_id:
        # Fallback if we can't find the proper tool call ID
        return {"messages": []}

    # Return proper ToolMessage
    return {"messages": [ToolMessage(content="updated profile", tool_call_id=tool_call_id)]}

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
        
    # Find the tool call that triggered this update
    tool_call_id = get_tool_call_id(state, 'UpdateMemory')

    if not tool_call_id:
        # Fallback if we can't find the proper tool call ID
        return {"messages": []}

    # Extract the changes made by Trustcall and add to the ToolMessage returned to task_mAIstro
    todo_update_msg = extract_tool_info(spy.called_tools, tool_name)
    return {"messages": [ToolMessage(content=todo_update_msg, tool_call_id=tool_call_id)]}

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

    # Find the tool call that triggered this update
    tool_call_id = get_tool_call_id(state, 'UpdateMemory')

    if not tool_call_id:
        # Fallback if we can't find the proper tool call ID
        return {"messages": []}

    # Return proper ToolMessage
    return {"messages": [ToolMessage(content="updated instructions", tool_call_id=tool_call_id)]}

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
        
    # Find the tool call that triggered this update
    tool_call_id = get_tool_call_id(state, 'UpdateMemory')

    if not tool_call_id:
        # Fallback if we can't find the proper tool call ID
        return {"messages": []}

    # Extract the changes made by Trustcall and add to the ToolMessage returned to task_mAIstro
    email_update_msg = extract_tool_info(spy.called_tools, tool_name)
    return {"messages": [ToolMessage(content=email_update_msg, tool_call_id=tool_call_id)]}

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
    gmail_tool_names = {tool.name: tool for tool in GMAIL_TOOLS}
    tool_responses = []

    for tool_call in ai_message_with_tools.tool_calls:
        tool_call_id = None
        tool_name = None
        raw_args = None

        if isinstance(tool_call, dict):
            tool_call_id = tool_call.get("id")
            if "function" in tool_call and isinstance(tool_call["function"], dict):
                fn = tool_call["function"]
                tool_name = fn.get("name") or tool_call.get("name")
                raw_args = fn.get("arguments")
            else:
                tool_name = tool_call.get("name")
                raw_args = tool_call.get("args")
        else:
            tool_call_id = getattr(tool_call, "id", None)
            function = getattr(tool_call, "function", None)
            if function is not None:
                tool_name = getattr(function, "name", None) or getattr(tool_call, "name", None)
                raw_args = getattr(function, "arguments", None)
            else:
                tool_name = getattr(tool_call, "name", None)
                raw_args = getattr(tool_call, "args", None)

        if tool_call_id is None:
            logger.warning("Skipping Gmail tool call without id: %s", tool_call)
            continue

        # Normalise arguments from OpenAI tool payloads (they arrive as JSON strings)
        tool_args: dict[str, object]
        if isinstance(raw_args, str):
            try:
                tool_args = json.loads(raw_args) if raw_args else {}
            except json.JSONDecodeError:
                logger.warning("Failed to parse arguments for %s: %s", tool_name, raw_args)
                tool_args = {}
        elif isinstance(raw_args, dict):
            tool_args = raw_args.copy()
        elif raw_args is None:
            tool_args = {}
        else:
            tool_args = dict(raw_args) if isinstance(raw_args, list) else {}

        if tool_name not in gmail_tool_names:
            logger.warning("Unhandled Gmail tool call %s; returning noop response", tool_name)
            tool_responses.append(
                ToolMessage(
                    content=f"Unsupported Gmail operation '{tool_name}'",
                    tool_call_id=tool_call_id,
                )
            )
            continue

        gmail_operations.append(
            {
                "operation": tool_name,
                "args": tool_args,
                "timestamp": datetime.now().isoformat(),
            }
        )

        try:
            tool = gmail_tool_names[tool_name]
            args = tool_args.copy()
            try:
                config_payload = config.get("configurable", {})
            except AttributeError:
                config_payload = {}
            args["config"] = config_payload or {}

            result = tool.func(**args)
            tool_responses.append(
                ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call_id,
                )
            )
        except Exception as e:
            logger.exception("Error executing Gmail tool %s", tool_name)
            tool_responses.append(
                ToolMessage(
                    content=f"Error executing {tool_name}: {str(e)}",
                    tool_call_id=tool_call_id,
                )
            )

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
    """Decide next step. Route based on the most recent message with tool calls."""
    messages = state['messages']

    if not messages:
        return END

    # Look at the last few messages to understand context
    last_msg = messages[-1]

    # If the last message is a tool response, we should end (AI should respond)
    if hasattr(last_msg, 'type') and getattr(last_msg, 'type', None) == 'tool':
        return END

    # If last message is from human, we should respond
    if hasattr(last_msg, 'type') and getattr(last_msg, 'type', None) == 'human':
        return END

    # If last message is AI with tool calls, check if tools have already been executed
    if hasattr(last_msg, 'tool_calls') and getattr(last_msg, 'tool_calls', None):
        # Check if there are already tool responses for these tool calls
        tool_call_ids = set()
        for tc in last_msg.tool_calls:
            tc_id = tc.get('id') if isinstance(tc, dict) else getattr(tc, 'id', None)
            if tc_id:
                tool_call_ids.add(tc_id)

        # Look for tool responses that match these tool calls
        responded_ids = set()
        for msg in messages:
            if hasattr(msg, 'type') and getattr(msg, 'type', None) == 'tool':
                tc_id = getattr(msg, 'tool_call_id', None)
                if tc_id in tool_call_ids:
                    responded_ids.add(tc_id)

        # If all tool calls have responses, end (don't re-execute)
        if tool_call_ids and tool_call_ids.issubset(responded_ids):
            return END

        # Prevent infinite loops: check for repeated identical tool calls
        gmail_tool_names = ['search_gmail_by_sender_today', 'search_gmail_by_sender_on_date',
                           'list_gmail_messages', 'get_gmail_message', 'send_gmail_message',
                           'search_gmail', 'archive_gmail_message', 'delete_gmail_message',
                           'create_gmail_label', 'add_gmail_label', 'remove_gmail_label',
                           'mark_gmail_as_read', 'mark_gmail_as_unread', 'read_gmail_message',
                           'reply_to_gmail', 'check_gmail_service_status', 'search_gmail_smart']

        # Check for repeated identical tool calls (same tool + same args) to prevent loops
        tool_signatures = []
        for msg in messages[-5:]:  # Check last 5 messages for exact duplicates
            if hasattr(msg, 'tool_calls') and getattr(msg, 'tool_calls', None):
                for tc in msg.tool_calls:
                    tool_name = tc.get('name', '') if isinstance(tc, dict) else getattr(tc, 'name', '')
                    tool_args = tc.get('args', {}) if isinstance(tc, dict) else getattr(tc, 'args', {})
                    if tool_name in gmail_tool_names:
                        signature = (tool_name, str(sorted(tool_args.items())))
                        tool_signatures.append(signature)

        # If the same tool call appears more than twice, it's likely a loop
        from collections import Counter
        signature_counts = Counter(tool_signatures)
        if any(count > 2 for count in signature_counts.values()):
            return END

        # Route to appropriate handler for unanswered tool calls
        for tool_call in last_msg.tool_calls:
            tool_name = tool_call.get('name', '') if isinstance(tool_call, dict) else getattr(tool_call, 'name', '')

            # Gmail tools
            if tool_name in gmail_tool_names:
                return "handle_gmail"

            # Memory update tools
            if tool_name == 'UpdateMemory':
                args = tool_call.get('args', {}) if isinstance(tool_call, dict) else getattr(tool_call, 'args', {})
                update_type = args.get('update_type')
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
