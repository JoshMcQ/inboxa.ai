"""
Voice Command Processing for Email Operations

This module processes natural language voice commands and maps them to 
specific Gmail operations through the LangGraph workflow.
"""

import re
from typing import Dict, List, Optional, Tuple, Any
from langchain_core.tools import tool
from gmail_tools import GMAIL_TOOLS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceCommandProcessor:
    """Processes natural language voice commands for email operations"""
    
    def __init__(self):
        # Command patterns for different email operations
        self.command_patterns = {
            # Reading emails
            "read_emails": [
                r"(?i).*(?:read|show|display|get).*(?:emails?|messages?|inbox)",
                r"(?i).*what.*(?:emails?|messages?).*(?:have|got)",
                r"(?i).*check.*(?:emails?|messages?|inbox)",
                r"(?i).*list.*(?:emails?|messages?)"
            ],
            
            # Sending emails
            "send_email": [
                r"(?i).*(?:send|compose|write|draft).*(?:email|message)",
                r"(?i).*email.*(?:to|for).*",
                r"(?i).*write.*(?:to|for).*"
            ],
            
            # Replying
            "reply": [
                r"(?i).*reply.*(?:to|back)",
                r"(?i).*respond.*(?:to|back)",
                r"(?i).*answer.*(?:email|message)"
            ],
            
            # Archiving
            "archive": [
                r"(?i).*archive.*(?:emails?|messages?|this|that)",
                r"(?i).*move.*to.*archive",
                r"(?i).*(?:clean|organize).*inbox"
            ],
            
            # Searching
            "search": [
                r"(?i).*(?:search|find|look for).*(?:emails?|messages?)",
                r"(?i).*emails?.*(?:from|about|with)",
                r"(?i).*find.*(?:from|about|containing)"
            ],
            
            # Deleting/Trashing
            "delete": [
                r"(?i).*(?:delete|trash|remove).*(?:emails?|messages?|this|that)",
                r"(?i).*move.*to.*trash",
                r"(?i).*get rid of.*"
            ],
            
            # Marking as read/unread
            "mark_read": [
                r"(?i).*mark.*(?:as )?read",
                r"(?i).*(?:read|seen).*(?:this|that|emails?)"
            ],
            
            "mark_unread": [
                r"(?i).*mark.*(?:as )?unread",
                r"(?i).*(?:unread|not read).*(?:this|that|emails?)"
            ],
            
            # Labels
            "apply_label": [
                r"(?i).*(?:label|tag|categorize).*(?:as|with)",
                r"(?i).*add.*label",
                r"(?i).*organize.*(?:as|into)"
            ],
            
            # Spam
            "mark_spam": [
                r"(?i).*(?:spam|junk).*(?:this|that|emails?)",
                r"(?i).*mark.*(?:as )?spam"
            ],
            
            # Newsletters/Unsubscribe
            "unsubscribe": [
                r"(?i).*unsubscribe.*(?:from|to)",
                r"(?i).*(?:stop|cancel).*(?:newsletters?|subscriptions?)",
                r"(?i).*remove.*(?:me|myself).*(?:from|to)"
            ],
            
            # Bulk operations
            "bulk_archive": [
                r"(?i).*archive.*(?:all|everything|bulk)",
                r"(?i).*clean.*(?:up|out).*inbox",
                r"(?i).*archive.*(?:newsletters?|promotions?)"
            ]
        }
        
        # Context patterns for extracting recipients, subjects, etc.
        self.context_patterns = {
            "recipient": [
                r"(?i)(?:to|for)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
                r"(?i)(?:to|for)\s+(\w+(?:\s+\w+)?)",  # Name patterns
            ],
            "subject": [
                r"(?i)(?:about|subject|regarding)\s+(['\"].*?['\"]|\S+)",
                r"(?i)subject(?:\s+line)?\s*:\s*(['\"].*?['\"]|\S+)"
            ],
            "sender": [
                r"(?i)(?:from|by)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
                r"(?i)(?:from|by)\s+(\w+(?:\s+\w+)?)"
            ],
            "label": [
                r"(?i)(?:label|tag).*?(?:as|with)\s+(['\"].*?['\"]|\w+)",
                r"(?i)(?:into|as)\s+(['\"].*?['\"]|\w+)"
            ],
            "count": [
                r"(?i)(?:first|last|latest)\s+(\d+)",
                r"(?i)(\d+)\s+(?:emails?|messages?)"
            ]
        }

    def parse_voice_command(self, command: str) -> Dict[str, Any]:
        """
        Parse a natural language voice command and extract intent and parameters
        
        Args:
            command: The voice command text
            
        Returns:
            Dictionary containing intent, action, and extracted parameters
        """
        command = command.strip()
        logger.info(f"Processing voice command: '{command}'")
        
        # Determine the intent
        intent = self._classify_intent(command)
        
        # Extract context parameters
        context = self._extract_context(command)
        
        # Map to specific Gmail tool
        tool_mapping = self._map_to_gmail_tool(intent, context)
        
        result = {
            "intent": intent,
            "original_command": command,
            "context": context,
            "tool_mapping": tool_mapping,
            "confidence": self._calculate_confidence(intent, context)
        }
        
        logger.info(f"Parsed command result: {result}")
        return result
    
    def _classify_intent(self, command: str) -> str:
        """Classify the intent of the voice command"""
        for intent, patterns in self.command_patterns.items():
            for pattern in patterns:
                if re.search(pattern, command):
                    return intent
        
        # Default intent if no pattern matches
        return "general_query"
    
    def _extract_context(self, command: str) -> Dict[str, Any]:
        """Extract contextual information from the command"""
        context = {}
        
        for context_type, patterns in self.context_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, command)
                if match:
                    context[context_type] = match.group(1).strip('\'"')
                    break
        
        return context
    
    def _map_to_gmail_tool(self, intent: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Map intent and context to specific Gmail tool and parameters"""
        
        # Intent to Gmail tool mapping
        tool_mappings = {
            "read_emails": {
                "tool": "list_gmail_messages",
                "params": {
                    "max_results": int(context.get("count", 10))
                }
            },
            "send_email": {
                "tool": "send_gmail",
                "params": {
                    "recipient": context.get("recipient", ""),
                    "subject": context.get("subject", ""),
                    "body": ""  # Will be filled by AI
                }
            },
            "reply": {
                "tool": "reply_to_gmail",
                "params": {
                    "message_id": "",  # Will need to be determined from context
                    "reply_body": ""   # Will be generated by AI
                }
            },
            "search": {
                "tool": "search_gmail",
                "params": {
                    "query": self._build_search_query(context),
                    "max_results": int(context.get("count", 10))
                }
            },
            "archive": {
                "tool": "archive_message",
                "params": {
                    "message_id": ""  # Will need to be determined
                }
            },
            "delete": {
                "tool": "trash_message", 
                "params": {
                    "message_id": ""  # Will need to be determined
                }
            },
            "mark_read": {
                "tool": "mark_message_read",
                "params": {
                    "message_id": ""  # Will need to be determined
                }
            },
            "mark_unread": {
                "tool": "mark_message_unread",
                "params": {
                    "message_id": ""  # Will need to be determined
                }
            },
            "apply_label": {
                "tool": "apply_labels_to_message",
                "params": {
                    "message_id": "",  # Will need to be determined
                    "label_ids": [context.get("label", "")]
                }
            },
            "mark_spam": {
                "tool": "mark_message_spam",
                "params": {
                    "message_id": ""  # Will need to be determined
                }
            },
            "bulk_archive": {
                "tool": "search_gmail",  # First search, then bulk archive
                "params": {
                    "query": "category:promotions OR category:social",
                    "max_results": 50
                }
            }
        }
        
        return tool_mappings.get(intent, {"tool": None, "params": {}})
    
    def _build_search_query(self, context: Dict[str, Any]) -> str:
        """Build Gmail search query from context"""
        query_parts = []
        
        if context.get("sender"):
            query_parts.append(f"from:{context['sender']}")
        
        if context.get("subject"):
            query_parts.append(f"subject:{context['subject']}")
        
        if not query_parts:
            # Default search if no specific context
            query_parts.append("is:unread")
        
        return " ".join(query_parts)
    
    def _calculate_confidence(self, intent: str, context: Dict[str, Any]) -> float:
        """Calculate confidence score for the parsed command"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on matched patterns
        if intent != "general_query":
            confidence += 0.3
        
        # Increase confidence based on extracted context
        if context:
            confidence += min(0.2, len(context) * 0.05)
        
        return min(1.0, confidence)

# Create tool for voice command processing
@tool
def process_voice_command(command: str) -> str:
    """
    Process a natural language voice command for email operations.
    
    Args:
        command: The voice command text
        
    Returns:
        String with parsed command information and suggested actions
    """
    processor = VoiceCommandProcessor()
    result = processor.parse_voice_command(command)
    
    # Format response for the AI assistant
    if result["tool_mapping"]["tool"]:
        response = f"""
Voice command processed: '{command}'

Intent: {result['intent']}
Confidence: {result['confidence']:.2f}
Suggested tool: {result['tool_mapping']['tool']}
Parameters: {result['tool_mapping']['params']}

I'll help you {result['intent'].replace('_', ' ')} using Gmail.
"""
    else:
        response = f"""
Voice command received: '{command}'

I understand you want to work with your email, but I need more specific information to help you. 
Could you be more specific about what you'd like me to do?

For example:
- "Read my emails" 
- "Send an email to John about the meeting"
- "Search for emails from Sarah"
- "Archive all newsletters"
"""
    
    return response.strip()

# Global processor instance
voice_processor = VoiceCommandProcessor()

# Common voice command examples for reference
VOICE_COMMAND_EXAMPLES = {
    "Email Reading": [
        "Read my emails",
        "What emails do I have?", 
        "Show me my inbox",
        "Check my messages"
    ],
    "Email Sending": [
        "Send an email to john@example.com about the meeting",
        "Compose an email to Sarah",
        "Write an email to the team"
    ],
    "Email Management": [
        "Archive all newsletters",
        "Delete spam emails", 
        "Mark this as read",
        "Label this as important"
    ],
    "Search & Find": [
        "Find emails from Google",
        "Search for emails about project update",
        "Show me unread messages from yesterday"
    ],
    "Bulk Operations": [
        "Archive all promotional emails",
        "Unsubscribe from newsletters",
        "Clean up my inbox"
    ]
}