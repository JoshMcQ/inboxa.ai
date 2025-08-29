import uuid
from datetime import datetime

from pydantic import BaseModel, Field
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

import os
from dotenv import load_dotenv
load_dotenv()

# Initialize the model
model = ChatOpenAI(model="gpt-4o", temperature=0)

# Simplified chatbot instruction
MODEL_SYSTEM_MESSAGE = """{task_maistro_role} 

You are a helpful voice-first email assistant for InboxA.AI. You help users manage their emails, create tasks, and stay organized.

Here are your current capabilities:
- Answer questions about emails and organization
- Help with task planning and management
- Provide voice-first, conversational responses
- Keep responses concise and actionable

Respond naturally and helpfully to the user's request."""

def task_mAIstro_simple(state: MessagesState, config: RunnableConfig, store: BaseStore):
    """Simple chatbot response without complex memory management for now."""
    
    # Get the user ID from the config
    configurable = configuration.Configuration.from_runnable_config(config)
    task_maistro_role = configurable.task_maistro_role

    system_msg = MODEL_SYSTEM_MESSAGE.format(task_maistro_role=task_maistro_role)

    # Simple response using the chat history
    response = model.invoke([SystemMessage(content=system_msg)] + state["messages"])

    return {"messages": [response]}

# Create the simple graph
builder = StateGraph(MessagesState, config_schema=configuration.Configuration)

# Define the simple flow
builder.add_node("task_mAIstro", task_mAIstro_simple)

# Define the flow 
builder.add_edge(START, "task_mAIstro")
builder.add_edge("task_mAIstro", END)

# Compile the graph
graph = builder.compile()