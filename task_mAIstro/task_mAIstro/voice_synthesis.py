"""
ElevenLabs Voice Synthesis Integration for task_mAIstro

This module provides text-to-speech capabilities using ElevenLabs API
for natural voice responses from the AI assistant.
"""

import os
import io
import requests
import base64
import re
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class VoiceError(Exception):
    """Custom exception for voice synthesis errors"""
    pass

class ElevenLabsVoice:
    """ElevenLabs voice synthesis client"""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.base_url = "https://api.elevenlabs.io/v1"
        
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not found. Voice synthesis will be disabled.")
            self.enabled = False
        else:
            self.enabled = True
            logger.info("ElevenLabs voice synthesis initialized")
        
        # Default voice settings (professional, clear female voice)
        self.default_voice_id = "pNInz6obpgDQGcFmaJgB"  # Adam (male)
        # Alternative voices:
        # "21m00Tcm4TlvDq8ikWAM" - Rachel (female)
        # "AZnzlk1XvdvUeBnXmlld" - Domi (female) 
        # "EXAVITQu4vr4xnSDxMaL" - Bella (female)
        # "ErXwobaYiN019PkySvjV" - Antoni (male)
        # "MF3mGyEYCl7XYWbV9V6O" - Elli (female)
        # "TxGEqnHWrfWFTfGW9XjX" - Josh (male)
        # "VR6AewLTigWG4xSOukaG" - Arnold (male)
        # "pqHfZKP75CvOlQylNhV4" - Bill (male)
        
        self.voice_settings = {
            "stability": 0.75,      # How stable the voice is (0.0-1.0)
            "similarity_boost": 0.75,  # How similar to original voice (0.0-1.0)
            "style": 0.0,           # Style exaggeration (0.0-1.0)
            "use_speaker_boost": True  # Enhance speaker characteristics
        }
    
    def synthesize_speech(self, 
                         text: str, 
                         voice_id: Optional[str] = None,
                         model: str = "eleven_monolingual_v1") -> Optional[bytes]:
        """
        Synthesize speech from text using ElevenLabs API
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (defaults to default_voice_id)
            model: Model to use for synthesis
            
        Returns:
            Audio bytes if successful, None if failed
        """
        if not self.enabled:
            logger.warning("Voice synthesis is disabled (no API key)")
            return None
        
        if not text or not text.strip():
            logger.warning("Empty text provided for speech synthesis")
            return None
            
        voice_id = voice_id or self.default_voice_id
        
        try:
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text.strip(),
                "model_id": model,
                "voice_settings": self.voice_settings
            }
            
            logger.info(f"Synthesizing speech for text: '{text[:50]}...' with voice {voice_id}")
            
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                logger.info("Speech synthesis successful")
                return response.content
            elif response.status_code == 401:
                raise VoiceError("Invalid ElevenLabs API key")
            elif response.status_code == 402:
                raise VoiceError("ElevenLabs quota exceeded") 
            elif response.status_code == 422:
                raise VoiceError("Invalid voice parameters")
            else:
                raise VoiceError(f"ElevenLabs API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            raise VoiceError("Cannot connect to ElevenLabs API")
        except requests.exceptions.Timeout:
            raise VoiceError("ElevenLabs API request timeout")
        except requests.exceptions.RequestException as e:
            raise VoiceError(f"Request failed: {str(e)}")
    
    def synthesize_to_base64(self, text: str, voice_id: Optional[str] = None) -> Optional[str]:
        """
        Synthesize speech and return as base64 string for web playback
        
        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use
            
        Returns:
            Base64 encoded audio string if successful, None if failed
        """
        try:
            audio_bytes = self.synthesize_speech(text, voice_id)
            if audio_bytes:
                return base64.b64encode(audio_bytes).decode('utf-8')
            return None
        except VoiceError as e:
            logger.error(f"Voice synthesis failed: {str(e)}")
            return None
    
    def get_available_voices(self) -> Optional[Dict[str, Any]]:
        """
        Get list of available voices from ElevenLabs
        
        Returns:
            Dictionary of available voices if successful, None if failed
        """
        if not self.enabled:
            return None
            
        try:
            url = f"{self.base_url}/voices"
            headers = {
                "Accept": "application/json",
                "xi-api-key": self.api_key
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get voices: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get voices: {str(e)}")
            return None
    
    def set_voice_settings(self, stability: float = 0.75, similarity_boost: float = 0.75, 
                          style: float = 0.0, use_speaker_boost: bool = True):
        """
        Update voice settings
        
        Args:
            stability: Voice stability (0.0-1.0)
            similarity_boost: Similarity to original voice (0.0-1.0) 
            style: Style exaggeration (0.0-1.0)
            use_speaker_boost: Whether to enhance speaker characteristics
        """
        self.voice_settings.update({
            "stability": max(0.0, min(1.0, stability)),
            "similarity_boost": max(0.0, min(1.0, similarity_boost)),
            "style": max(0.0, min(1.0, style)),
            "use_speaker_boost": use_speaker_boost
        })
        logger.info(f"Voice settings updated: {self.voice_settings}")

# Global voice synthesizer instance
voice_synthesizer = ElevenLabsVoice()

def strip_markdown(text: str) -> str:
    """
    Remove markdown formatting from text for voice synthesis
    
    Args:
        text: Text with potential markdown formatting
        
    Returns:
        Clean text suitable for speech synthesis
    """
    # Remove bold/italic asterisks and underscores
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # **bold** -> bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # *italic* -> italic
    text = re.sub(r'__(.*?)__', r'\1', text)      # __bold__ -> bold
    text = re.sub(r'_(.*?)_', r'\1', text)        # _italic_ -> italic
    
    # Remove code blocks and inline code
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)  # ```code``` -> (remove)
    text = re.sub(r'`(.*?)`', r'\1', text)        # `code` -> code
    
    # Remove headers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)  # # Header -> Header
    
    # Remove links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)  # [text](url) -> text
    
    # Remove bullet points and list formatting
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)  # - item -> item
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # 1. item -> item
    
    # Clean up extra whitespace
    text = re.sub(r'\n\s*\n', '\n', text)  # Multiple newlines -> single
    text = text.strip()
    
    return text

def synthesize_response(text: str, voice_id: Optional[str] = None) -> Optional[str]:
    """
    Convenience function to synthesize speech and return base64 audio
    
    Args:
        text: Text to convert to speech
        voice_id: Voice ID to use (optional)
        
    Returns:
        Base64 encoded audio string if successful, None if failed
    """
    # Strip markdown formatting before synthesis
    clean_text = strip_markdown(text)
    logger.info(f"Original text: {text[:100]}...")
    logger.info(f"Cleaned text: {clean_text[:100]}...")
    
    return voice_synthesizer.synthesize_to_base64(clean_text, voice_id)

def is_voice_enabled() -> bool:
    """Check if voice synthesis is available"""
    return voice_synthesizer.enabled

def get_voice_info() -> Dict[str, Any]:
    """Get information about voice synthesis status and settings"""
    return {
        "enabled": voice_synthesizer.enabled,
        "voice_id": voice_synthesizer.default_voice_id,
        "settings": voice_synthesizer.voice_settings,
        "api_configured": bool(voice_synthesizer.api_key)
    }

# Voice personality presets for different contexts
VOICE_PRESETS = {
    "professional": {
        "stability": 0.85,
        "similarity_boost": 0.75,
        "style": 0.0,
        "use_speaker_boost": True
    },
    "friendly": {
        "stability": 0.65,
        "similarity_boost": 0.80,
        "style": 0.2,
        "use_speaker_boost": True
    },
    "energetic": {
        "stability": 0.55,
        "similarity_boost": 0.70,
        "style": 0.4,
        "use_speaker_boost": True
    },
    "calm": {
        "stability": 0.90,
        "similarity_boost": 0.85,
        "style": 0.0,
        "use_speaker_boost": False
    }
}

def set_voice_preset(preset_name: str):
    """Set voice to a predefined personality preset"""
    if preset_name in VOICE_PRESETS:
        settings = VOICE_PRESETS[preset_name]
        voice_synthesizer.set_voice_settings(**settings)
        logger.info(f"Voice preset set to: {preset_name}")
        return True
    else:
        logger.warning(f"Unknown voice preset: {preset_name}")
        return False