#!/usr/bin/env python3
"""
FastAPI server for the task_mAIstro LangGraph agent
This provides the same API interface as LangGraph Studio but runs locally without Docker
"""

import json
import os
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from task_maistro import builder
from langgraph.store.memory import InMemoryStore
from langgraph.checkpoint.memory import MemorySaver
from voice_synthesis import synthesize_response, is_voice_enabled, get_voice_info

# Initialize FastAPI app
app = FastAPI(title="task_mAIstro API", version="1.0.0")

# Add CORS middleware for web integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize store and checkpointer
store = InMemoryStore()
checkpointer = MemorySaver()

# Compile the graph with store and checkpointer
compiled_graph = builder.compile(store=store, checkpointer=checkpointer)

# Request/Response models
class Message(BaseModel):
    role: str
    content: str

class RunRequest(BaseModel):
    assistant_id: str
    input: Dict[str, List[Message]]
    config: Dict[str, Any]
    stream_mode: str = "values"
    enable_voice: bool = False

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str = "task_mAIstro"
    voice_enabled: bool = False

class VoiceResponse(BaseModel):
    text: str
    audio_base64: Optional[str] = None
    voice_enabled: bool = False

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        voice_enabled=is_voice_enabled()
    )

@app.post("/runs/stream")
async def stream_run(request: RunRequest):
    """Stream a graph execution - compatible with LangGraph API"""
    
    try:
        # Convert request format to LangGraph format
        messages = []
        for msg in request.input.get("messages", []):
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Create thread config
        config = {
            "configurable": {
                **request.config.get("configurable", {}),
                "thread_id": f"thread_{datetime.now().timestamp()}"
            }
        }
        
        async def generate_stream():
            """Generate streaming responses"""
            try:
                print(f"DEBUG: Starting stream for messages: {messages}")
                
                # Collect all chunks first, then synthesize voice for final response only
                all_chunks = []
                final_response = None
                
                # Stream the graph execution
                async for chunk in compiled_graph.astream(
                    {"messages": messages}, 
                    config=config
                ):
                    print(f"DEBUG chunk: {chunk}")
                    all_chunks.append(chunk)
                    
                    # Extract the latest AI message 
                    # LangGraph streaming chunks have node names as keys
                    messages_in_chunk = []
                    for node_name, node_data in chunk.items():
                        if isinstance(node_data, dict) and "messages" in node_data:
                            messages_in_chunk = node_data["messages"]
                            break
                    
                    # Store the latest complete response for voice synthesis
                    if messages_in_chunk:
                        final_response = messages_in_chunk
                
                # Now process all chunks for streaming, but only synthesize voice for final response
                audio_base64 = None
                
                for i, chunk in enumerate(all_chunks):
                    messages_in_chunk = []
                    for node_name, node_data in chunk.items():
                        if isinstance(node_data, dict) and "messages" in node_data:
                            messages_in_chunk = node_data["messages"]
                            break
                    
                    # Only synthesize voice for the very last chunk with a complete AI response
                    is_final_chunk = (i == len(all_chunks) - 1)
                    if request.enable_voice and is_final_chunk and final_response:
                        # Get the last message from the assistant
                        last_message = final_response[-1]
                        if hasattr(last_message, 'content') and last_message.content:
                            # Synthesize voice for AI responses only
                            if getattr(last_message, 'role', None) == 'assistant' or \
                               (hasattr(last_message, 'type') and last_message.type == 'ai'):
                                text_content = str(last_message.content)
                                if text_content.strip():
                                    print(f"DEBUG: Synthesizing voice for final response: {text_content[:100]}...")
                                    audio_base64 = synthesize_response(text_content)
                    
                    # Convert LangChain messages to JSON-serializable format
                    serializable_messages = []
                    for msg in messages_in_chunk:
                        if hasattr(msg, 'content') and hasattr(msg, 'type'):
                            # LangChain message object
                            role = "assistant" if msg.type == "ai" else "human" if msg.type == "human" else "system"
                            serializable_messages.append({
                                "role": role,
                                "content": msg.content
                            })
                        elif isinstance(msg, dict):
                            # Already serializable
                            serializable_messages.append(msg)
                    
                    # Format response to match expected format
                    response_data = {
                        "messages": serializable_messages,
                        "timestamp": datetime.now().isoformat(),
                        "audio_base64": audio_base64,
                        "voice_enabled": request.enable_voice and is_voice_enabled()
                    }
                    
                    # Yield JSON line format
                    yield f"{json.dumps(response_data)}\n"
                    
                    # Small delay to make streaming visible
                    await asyncio.sleep(0.1)
                    
            except Exception as e:
                import traceback
                print(f"ERROR: {e}")
                print(f"TRACEBACK: {traceback.format_exc()}")
                error_response = {
                    "error": str(e),
                    "type": "execution_error",
                    "timestamp": datetime.now().isoformat(),
                    "traceback": traceback.format_exc()
                }
                yield f"{json.dumps(error_response)}\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"Content-Type": "text/plain"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "service": "task_mAIstro API",
        "version": "1.0.0",
        "status": "running",
        "voice_enabled": is_voice_enabled(),
        "endpoints": {
            "health": "/health",
            "stream_run": "/runs/stream",
            "voice_info": "/voice/info",
            "voice_synthesize": "/voice/synthesize",
            "docs": "/docs"
        }
    }

@app.get("/runs")
async def list_runs():
    """List runs endpoint (placeholder)"""
    return {"runs": [], "message": "Run history not implemented yet"}

@app.get("/voice/info")
async def get_voice_status():
    """Get voice synthesis information and status"""
    return get_voice_info()

@app.post("/voice/synthesize")
async def synthesize_text(request: Dict[str, str]):
    """Synthesize text to speech"""
    text = request.get("text", "")
    voice_id = request.get("voice_id")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    if not is_voice_enabled():
        raise HTTPException(status_code=503, detail="Voice synthesis is not available")
    
    try:
        audio_base64 = synthesize_response(text, voice_id)
        if audio_base64:
            return {
                "text": text,
                "audio_base64": audio_base64,
                "voice_enabled": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to synthesize speech")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 2024))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting task_mAIstro API server on {host}:{port}")
    print(f"📊 LangSmith tracing: {os.getenv('LANGSMITH_TRACING', 'false')}")
    print(f"🔑 OpenAI API configured: {'✅' if os.getenv('OPENAI_API_KEY') else '❌'}")
    print(f"🎵 ElevenLabs configured: {'✅' if os.getenv('ELEVENLABS_API_KEY') else '❌'}")
    if is_voice_enabled():
        print(f"🎤 Voice synthesis: Enabled")
    else:
        print(f"🎤 Voice synthesis: Disabled (set ELEVENLABS_API_KEY to enable)")
    print(f"📧 Gmail tools: Integrated")
    print(f"🧠 Memory system: Active")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )