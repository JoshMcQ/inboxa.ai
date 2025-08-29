#!/usr/bin/env python3
"""
Test script to debug the task_mAIstro node directly
"""
import asyncio
from langgraph.graph import MessagesState
from langgraph.store.memory import InMemoryStore
from task_maistro import task_mAIstro, configuration, GMAIL_TOOLS
from langchain_core.messages import HumanMessage

def test_tools():
    print("Testing Gmail tools...")
    for i, tool in enumerate(GMAIL_TOOLS):
        print(f"Tool {i}: {tool}")
        print(f"  Name: {getattr(tool, 'name', 'NO NAME')}")
        print(f"  Has __name__: {hasattr(tool, '__name__')}")
        if hasattr(tool, '__name__'):
            print(f"  __name__: {tool.__name__}")
        print()

async def test_node():
    print("Testing Gmail tools first...")
    test_tools()
    
    print("\nTesting task_mAIstro node directly...")
    
    # Create test state
    state = MessagesState(messages=[HumanMessage(content="Hello, can you help me check my emails?")])
    
    # Create test config
    config = {
        "configurable": {
            "user_id": "test_user",
            "todo_category": "general", 
            "task_maistro_role": "You are a helpful voice-controlled email assistant."
        }
    }
    
    # Create store
    store = InMemoryStore()
    
    try:
        print("Calling task_mAIstro node...")
        result = task_mAIstro(state, config, store)
        print(f"Result: {result}")
        print(f"Messages: {result.get('messages', [])}")
        for msg in result.get('messages', []):
            print(f"Message content: {getattr(msg, 'content', 'No content')}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_node())