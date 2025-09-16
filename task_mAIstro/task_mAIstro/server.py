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
        
        # Create thread config with a stable thread_id so the agent keeps context across turns
        incoming_cfg = request.config.get("configurable", {}) if isinstance(request.config, dict) else {}
        user_id = incoming_cfg.get("user_id")
        email_acct = incoming_cfg.get("email_account_id")
        convo_id = incoming_cfg.get("conversation_id")
        provided_thread = incoming_cfg.get("thread_id")

        stable_thread = (
            convo_id
            or provided_thread
            or (f"{user_id}:{email_acct}" if user_id and email_acct else None)
            or f"thread_{datetime.now().timestamp()}"
        )

        config = {
            "configurable": {
                **incoming_cfg,
                "thread_id": stable_thread,
            },
            "recursion_limit": 15  # Prevent infinite loops, lower than default 25
        }
        
        async def generate_stream():
            """Generate streaming responses with low latency (yield per chunk)."""
            try:
                print(f"DEBUG: Starting stream for messages: {messages}")

                last_ai_text: Optional[str] = None

                async for chunk in compiled_graph.astream({"messages": messages}, config=config):
                    print(f"DEBUG chunk: {chunk}")

                    # Extract messages from this chunk
                    messages_in_chunk = []
                    for _, node_data in chunk.items():
                        if isinstance(node_data, dict) and "messages" in node_data:
                            messages_in_chunk = node_data["messages"]
                            break

                    # Track final AI text so we can synthesize once at the end (optional)
                    if messages_in_chunk:
                        last = messages_in_chunk[-1]
                        if hasattr(last, 'content') and hasattr(last, 'type') and getattr(last, 'type', None) == 'ai':
                            last_ai_text = str(getattr(last, 'content', '') or '')

                    # Convert to serializable message list
                    serializable_messages = []
                    for msg in messages_in_chunk:
                        if hasattr(msg, 'content') and hasattr(msg, 'type'):
                            role = "assistant" if msg.type == "ai" else "human" if msg.type == "human" else "system"
                            serializable_messages.append({"role": role, "content": msg.content})
                        elif isinstance(msg, dict):
                            serializable_messages.append(msg)

                    response_data = {
                        "messages": serializable_messages,
                        "timestamp": datetime.now().isoformat(),
                        "audio_base64": None,  # audio synthesized at end only
                        "voice_enabled": request.enable_voice and is_voice_enabled(),
                    }
                    # Yield immediately for low latency
                    yield f"{json.dumps(response_data)}\n"

                # After stream completes, optionally synthesize voice for the final AI text
                if request.enable_voice and is_voice_enabled() and last_ai_text:
                    try:
                        audio_base64 = synthesize_response(last_ai_text)
                        voice_response = {
                            'messages': [{ 'role': 'assistant', 'content': last_ai_text }],
                            'timestamp': datetime.now().isoformat(),
                            'audio_base64': audio_base64,
                            'voice_enabled': True
                        }
                        yield f"{json.dumps(voice_response)}\n"
                    except Exception as ve:
                        print(f"Voice synthesis failed: {ve}")

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
