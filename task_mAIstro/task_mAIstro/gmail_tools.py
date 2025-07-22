"""
Gmail Integration Tools for Task mAIstro LangGraph Agent

This module provides comprehensive Gmail functionality including:
- Send emails
- Read and search messages
- Manage threads and conversations
- Label management
- Archive and trash operations

All tools are designed to work with the Gmail microservice running on localhost:3001
"""

import requests
import json
from typing import List, Optional, Dict, Any
from langchain_core.tools import tool
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Gmail service configuration
GMAIL_SERVICE_URL = os.getenv("GMAIL_SERVICE_URL", "http://localhost:3001")

class GmailError(Exception):
    """Custom exception for Gmail-related errors"""
    pass

def _make_gmail_request(method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Make a secure request to the Gmail microservice with proper error handling
    """
    url = f"{GMAIL_SERVICE_URL}{endpoint}"
    
    try:
        # Set timeout and proper headers
        headers = {"Content-Type": "application/json"} if data else {}
        timeout = 30  # 30 second timeout
        
        if method.upper() == "GET":
            response = requests.get(url, params=params, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == "DELETE":
            response = requests.delete(url, json=data, headers=headers, timeout=timeout)
        else:
            raise GmailError(f"Unsupported HTTP method: {method}")
        
        # Handle different response codes appropriately
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            raise GmailError("Authentication required. Please authenticate with Gmail first.")
        elif response.status_code == 403:
            raise GmailError("Insufficient permissions. Check Gmail API permissions.")
        elif response.status_code == 429:
            raise GmailError("Rate limit exceeded. Please try again later.")
        elif response.status_code == 404:
            raise GmailError("Endpoint not found. Check Gmail service configuration.")
        else:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', f'HTTP {response.status_code}')
                raise GmailError(f"Gmail API error: {error_msg}")
            except:
                raise GmailError(f"Gmail API error: HTTP {response.status_code} - {response.text[:200]}")
    
    except requests.exceptions.ConnectionError:
        raise GmailError(f"Cannot connect to Gmail service at {GMAIL_SERVICE_URL}. Is the service running?")
    except requests.exceptions.Timeout:
        raise GmailError("Request timeout. Gmail service may be overloaded.")
    except requests.exceptions.RequestException as e:
        raise GmailError(f"Request failed: {str(e)}")

# =============================================================================
# CORE EMAIL TOOLS
# =============================================================================

@tool
def send_gmail(recipient: str, subject: str, body: str) -> str:
    """
    Send an email via Gmail API.
    
    Args:
        recipient: Email address of the recipient
        subject: Subject line of the email
        body: HTML or plain text body of the email
    
    Returns:
        String confirming email was sent with message ID
    """
    try:
        result = _make_gmail_request("POST", "/send", {
            "to": recipient,
            "subject": subject,
            "body": body
        })
        return f"✅ Email sent successfully to {recipient}! Message ID: {result.get('messageId', 'unknown')}"
    except GmailError as e:
        return f"❌ Failed to send email: {str(e)}"

@tool
def send_gmail_with_attachments(recipient: str, subject: str, body: str, attachment_paths: List[str] = None) -> str:
    """
    Send an email with attachments via Gmail API.
    
    Args:
        recipient: Email address of the recipient
        subject: Subject line of the email
        body: HTML or plain text body of the email
        attachment_paths: List of file paths to attach (optional)
    
    Returns:
        String confirming email was sent with message ID
    """
    try:
        email_data = {
            "to": recipient,
            "subject": subject,
            "body": body
        }
        
        if attachment_paths:
            email_data["attachments"] = attachment_paths
            
        result = _make_gmail_request("POST", "/send", email_data)
        return f"✅ Email with attachments sent successfully to {recipient}! Message ID: {result.get('messageId', 'unknown')}"
    except GmailError as e:
        return f"❌ Failed to send email with attachments: {str(e)}"

@tool
def list_gmail_messages(max_results: int = 10, query: str = None) -> str:
    """
    List recent Gmail messages.
    
    Args:
        max_results: Maximum number of messages to return (default: 10)
        query: Optional search query to filter messages
    
    Returns:
        String with formatted list of messages
    """
    try:
        params = {"maxResults": max_results}
        if query:
            params["q"] = query
            
        result = _make_gmail_request("GET", "/api/messages", params=params)
        
        if not result.get("messages"):
            return "📭 No messages found."
        
        messages = result["messages"]
        formatted_messages = []
        
        for i, msg in enumerate(messages[:max_results], 1):
            formatted_msg = f"""
{i}. From: {msg.get('from', 'Unknown')}
   Subject: {msg.get('subject', 'No subject')}
   Date: {msg.get('date', 'Unknown date')}
   Snippet: {msg.get('snippet', 'No preview available')}
   Message ID: {msg.get('id', 'Unknown')}
"""
            formatted_messages.append(formatted_msg)
        
        return f"✅ Found {len(messages)} messages:\n" + "\n".join(formatted_messages)
    
    except GmailError as e:
        return f"❌ Failed to list messages: {str(e)}"

@tool
def read_gmail_message(message_id: str) -> str:
    """
    Read a specific Gmail message by ID.
    
    Args:
        message_id: The ID of the message to read
    
    Returns:
        String with formatted message content
    """
    try:
        result = _make_gmail_request("GET", f"/messages/{message_id}")
        
        return f"""
📧 Email Details:
From: {result.get('from', 'Unknown')}
To: {result.get('to', 'Unknown')}
Subject: {result.get('subject', 'No subject')}
Date: {result.get('date', 'Unknown date')}

Body:
{result.get('body', 'No content available')}
"""
    except GmailError as e:
        return f"❌ Failed to read message: {str(e)}"

@tool
def reply_to_gmail(message_id: str, reply_body: str) -> str:
    """
    Reply to a specific Gmail message.
    
    Args:
        message_id: The ID of the message to reply to
        reply_body: The body of the reply
    
    Returns:
        String confirming reply was sent
    """
    try:
        result = _make_gmail_request("POST", f"/messages/{message_id}/reply", {
            "body": reply_body
        })
        return f"✅ Reply sent successfully! Message ID: {result.get('messageId', 'unknown')}"
    except GmailError as e:
        return f"❌ Failed to send reply: {str(e)}"

@tool
def search_gmail(query: str, max_results: int = 10) -> str:
    """
    Search Gmail messages using Gmail search syntax.
    
    Args:
        query: Search query (e.g., "from:user@example.com", "subject:urgent", "is:unread")
        max_results: Maximum number of results to return
    
    Returns:
        String with formatted search results
    """
    try:
        data = {"query": query, "maxResults": max_results}
        result = _make_gmail_request("POST", "/api/messages/search", data=data)
        
        if not result.get("messages"):
            return f"🔍 No messages found for query: '{query}'"
        
        messages = result["messages"]
        formatted_results = []
        
        for i, msg in enumerate(messages, 1):
            formatted_msg = f"""
{i}. From: {msg.get('from', 'Unknown')}
   Subject: {msg.get('subject', 'No subject')}
   Date: {msg.get('date', 'Unknown date')}
   Snippet: {msg.get('snippet', 'No preview available')}
"""
            formatted_results.append(formatted_msg)
        
        return f"🔍 Search results for '{query}':\n" + "\n".join(formatted_results)
    
    except GmailError as e:
        return f"❌ Search failed: {str(e)}"

@tool
def check_gmail_service_status() -> str:
    """
    Check if the Gmail microservice is running and accessible.
    
    Returns:
        String with service status information
    """
    try:
        result = _make_gmail_request("GET", "/health")
        return f"✅ Gmail service is running. Status: {result.get('status', 'unknown')}"
    except GmailError as e:
        return f"❌ Gmail service is not accessible: {str(e)}"

# =============================================================================
# ADVANCED MESSAGE TOOLS
# =============================================================================

@tool
def mark_message_read(message_id: str) -> str:
    """Mark a specific message as read."""
    try:
        _make_gmail_request("PUT", f"/api/messages/{message_id}/read")
        return f"✅ Message {message_id} marked as read"
    except GmailError as e:
        return f"❌ Failed to mark message as read: {str(e)}"

@tool
def mark_message_unread(message_id: str) -> str:
    """Mark a specific message as unread."""
    try:
        _make_gmail_request("PUT", f"/api/messages/{message_id}/unread")
        return f"✅ Message {message_id} marked as unread"
    except GmailError as e:
        return f"❌ Failed to mark message as unread: {str(e)}"

@tool
def archive_message(message_id: str) -> str:
    """Archive a specific message."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/archive")
        return f"✅ Message {message_id} archived"
    except GmailError as e:
        return f"❌ Failed to archive message: {str(e)}"

@tool
def unarchive_message(message_id: str) -> str:
    """Unarchive a specific message."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/unarchive")
        return f"✅ Message {message_id} unarchived"
    except GmailError as e:
        return f"❌ Failed to unarchive message: {str(e)}"

@tool
def trash_message(message_id: str) -> str:
    """Move a specific message to trash."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/trash")
        return f"✅ Message {message_id} moved to trash"
    except GmailError as e:
        return f"❌ Failed to trash message: {str(e)}"

@tool
def untrash_message(message_id: str) -> str:
    """Restore a specific message from trash."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/untrash")
        return f"✅ Message {message_id} restored from trash"
    except GmailError as e:
        return f"❌ Failed to restore message: {str(e)}"

@tool
def delete_message(message_id: str) -> str:
    """Permanently delete a specific message."""
    try:
        _make_gmail_request("DELETE", f"/api/messages/{message_id}")
        return f"✅ Message {message_id} permanently deleted"
    except GmailError as e:
        return f"❌ Failed to delete message: {str(e)}"

@tool
def search_messages(query: str, max_results: int = 10) -> str:
    """Search messages with Gmail query syntax."""
    try:
        result = _make_gmail_request("POST", "/api/messages/search", {
            "query": query,
            "max": max_results
        })
        
        if not result.get("messages"):
            return f"🔍 No messages found for query: '{query}'"
        
        messages = result["messages"]
        formatted_results = []
        
        for i, msg in enumerate(messages, 1):
            formatted_msg = f"""
{i}. From: {msg.get('from', 'Unknown')}
   Subject: {msg.get('subject', 'No subject')}
   Date: {msg.get('date', 'Unknown date')}
   Snippet: {msg.get('snippet', 'No preview available')}
"""
            formatted_results.append(formatted_msg)
        
        return f"🔍 Search results for '{query}':\n" + "\n".join(formatted_results)
    
    except GmailError as e:
        return f"❌ Search failed: {str(e)}"

# =============================================================================
# THREAD MANAGEMENT TOOLS
# =============================================================================

@tool
def list_threads(max_results: int = 10, query: str = None) -> str:
    """List Gmail conversation threads."""
    try:
        params = {"max": max_results}
        if query:
            params["q"] = query
            
        result = _make_gmail_request("GET", "/api/threads", params=params)
        
        if not result.get("threads"):
            return "📭 No threads found."
        
        threads = result["threads"]
        formatted_threads = []
        
        for i, thread in enumerate(threads[:max_results], 1):
            formatted_thread = f"""
{i}. Thread ID: {thread.get('id', 'Unknown')}
   Subject: {thread.get('subject', 'No subject')}
   Messages: {thread.get('messageCount', 'Unknown')}
   Last Message: {thread.get('lastMessageDate', 'Unknown date')}
"""
            formatted_threads.append(formatted_thread)
        
        return f"🧵 Found {len(threads)} threads:\n" + "\n".join(formatted_threads)
    
    except GmailError as e:
        return f"❌ Failed to list threads: {str(e)}"

@tool
def get_thread_details(thread_id: str) -> str:
    """Get details of a specific thread."""
    try:
        result = _make_gmail_request("GET", f"/api/threads/{thread_id}")
        
        return f"""
🧵 Thread Details:
Thread ID: {result.get('id', 'Unknown')}
Subject: {result.get('subject', 'No subject')}
Messages: {result.get('messageCount', 'Unknown')}
Last Message: {result.get('lastMessageDate', 'Unknown date')}
"""
    except GmailError as e:
        return f"❌ Failed to get thread details: {str(e)}"

@tool
def search_threads(query: str, max_results: int = 10) -> str:
    """Search threads with Gmail query syntax."""
    try:
        result = _make_gmail_request("POST", "/api/threads/search", {
            "query": query,
            "max": max_results
        })
        
        if not result.get("threads"):
            return f"🔍 No threads found for query: '{query}'"
        
        threads = result["threads"]
        formatted_results = []
        
        for i, thread in enumerate(threads, 1):
            formatted_thread = f"""
{i}. Thread ID: {thread.get('id', 'Unknown')}
   Subject: {thread.get('subject', 'No subject')}
   Messages: {thread.get('messageCount', 'Unknown')}
"""
            formatted_results.append(formatted_thread)
        
        return f"🔍 Thread search results for '{query}':\n" + "\n".join(formatted_results)
    
    except GmailError as e:
        return f"❌ Thread search failed: {str(e)}"

@tool
def mark_thread_read(thread_id: str) -> str:
    """Mark a specific thread as read."""
    try:
        _make_gmail_request("PUT", f"/api/threads/{thread_id}/read")
        return f"✅ Thread {thread_id} marked as read"
    except GmailError as e:
        return f"❌ Failed to mark thread as read: {str(e)}"

@tool
def mark_thread_unread(thread_id: str) -> str:
    """Mark a specific thread as unread."""
    try:
        _make_gmail_request("PUT", f"/api/threads/{thread_id}/unread")
        return f"✅ Thread {thread_id} marked as unread"
    except GmailError as e:
        return f"❌ Failed to mark thread as unread: {str(e)}"

@tool
def archive_thread(thread_id: str) -> str:
    """Archive a specific thread."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/archive")
        return f"✅ Thread {thread_id} archived"
    except GmailError as e:
        return f"❌ Failed to archive thread: {str(e)}"

@tool
def unarchive_thread(thread_id: str) -> str:
    """Unarchive a specific thread."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/unarchive")
        return f"✅ Thread {thread_id} unarchived"
    except GmailError as e:
        return f"❌ Failed to unarchive thread: {str(e)}"

@tool
def trash_thread(thread_id: str) -> str:
    """Move a specific thread to trash."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/trash")
        return f"✅ Thread {thread_id} moved to trash"
    except GmailError as e:
        return f"❌ Failed to trash thread: {str(e)}"

@tool
def untrash_thread(thread_id: str) -> str:
    """Restore a specific thread from trash."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/untrash")
        return f"✅ Thread {thread_id} restored from trash"
    except GmailError as e:
        return f"❌ Failed to restore thread: {str(e)}"

@tool
def delete_thread(thread_id: str) -> str:
    """Permanently delete a specific thread."""
    try:
        _make_gmail_request("DELETE", f"/api/threads/{thread_id}")
        return f"✅ Thread {thread_id} permanently deleted"
    except GmailError as e:
        return f"❌ Failed to delete thread: {str(e)}"

# =============================================================================
# LABEL MANAGEMENT TOOLS
# =============================================================================

@tool
def list_labels() -> str:
    """List all Gmail labels."""
    try:
        result = _make_gmail_request("GET", "/api/labels")
        
        if not result.get("labels"):
            return "📝 No labels found."
        
        labels = result["labels"]
        formatted_labels = []
        
        for i, label in enumerate(labels, 1):
            formatted_label = f"""
{i}. Name: {label.get('name', 'Unknown')}
   ID: {label.get('id', 'Unknown')}
   Type: {label.get('type', 'Unknown')}
"""
            formatted_labels.append(formatted_label)
        
        return f"📝 Found {len(labels)} labels:\n" + "\n".join(formatted_labels)
    
    except GmailError as e:
        return f"❌ Failed to list labels: {str(e)}"

@tool
def get_label_details(label_id: str) -> str:
    """Get details of a specific label."""
    try:
        result = _make_gmail_request("GET", f"/api/labels/{label_id}")
        
        return f"""
📝 Label Details:
Name: {result.get('name', 'Unknown')}
ID: {result.get('id', 'Unknown')}
Type: {result.get('type', 'Unknown')}
Messages Total: {result.get('messagesTotal', 'Unknown')}
Messages Unread: {result.get('messagesUnread', 'Unknown')}
"""
    except GmailError as e:
        return f"❌ Failed to get label details: {str(e)}"

@tool
def create_label(name: str) -> str:
    """Create a new Gmail label."""
    try:
        result = _make_gmail_request("POST", "/api/labels", {
            "name": name
        })
        return f"✅ Label '{name}' created successfully! ID: {result.get('id', 'unknown')}"
    except GmailError as e:
        return f"❌ Failed to create label: {str(e)}"

@tool
def apply_labels_to_message(message_id: str, label_ids: List[str]) -> str:
    """Apply labels to a specific message."""
    try:
        _make_gmail_request("PUT", f"/api/messages/{message_id}/labels", {
            "labelIds": label_ids
        })
        return f"✅ Labels applied to message {message_id}"
    except GmailError as e:
        return f"❌ Failed to apply labels: {str(e)}"

@tool
def remove_labels_from_message(message_id: str, label_ids: List[str]) -> str:
    """Remove labels from a specific message."""
    try:
        _make_gmail_request("DELETE", f"/api/messages/{message_id}/labels", {
            "labelIds": label_ids
        })
        return f"✅ Labels removed from message {message_id}"
    except GmailError as e:
        return f"❌ Failed to remove labels: {str(e)}"

@tool
def apply_labels_to_thread(thread_id: str, label_ids: List[str]) -> str:
    """Apply labels to a specific thread."""
    try:
        _make_gmail_request("PUT", f"/api/threads/{thread_id}/labels", {
            "labelIds": label_ids
        })
        return f"✅ Labels applied to thread {thread_id}"
    except GmailError as e:
        return f"❌ Failed to apply labels: {str(e)}"

@tool
def remove_labels_from_thread(thread_id: str, label_ids: List[str]) -> str:
    """Remove labels from a specific thread."""
    try:
        _make_gmail_request("DELETE", f"/api/threads/{thread_id}/labels", {
            "labelIds": label_ids
        })
        return f"✅ Labels removed from thread {thread_id}"
    except GmailError as e:
        return f"❌ Failed to remove labels: {str(e)}"

# =============================================================================
# ADVANCED MESSAGE OPERATIONS
# =============================================================================

@tool
def mark_message_important(message_id: str) -> str:
    """Mark a specific message as important."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/important")
        return f"✅ Message {message_id} marked as important"
    except GmailError as e:
        return f"❌ Failed to mark message as important: {str(e)}"

@tool
def mark_message_not_important(message_id: str) -> str:
    """Mark a specific message as not important."""
    try:
        _make_gmail_request("DELETE", f"/api/messages/{message_id}/important")
        return f"✅ Message {message_id} marked as not important"
    except GmailError as e:
        return f"❌ Failed to mark message as not important: {str(e)}"

@tool
def mark_message_spam(message_id: str) -> str:
    """Mark a specific message as spam."""
    try:
        _make_gmail_request("POST", f"/api/messages/{message_id}/spam")
        return f"✅ Message {message_id} marked as spam"
    except GmailError as e:
        return f"❌ Failed to mark message as spam: {str(e)}"

@tool
def mark_message_not_spam(message_id: str) -> str:
    """Mark a specific message as not spam."""
    try:
        _make_gmail_request("DELETE", f"/api/messages/{message_id}/spam")
        return f"✅ Message {message_id} marked as not spam"
    except GmailError as e:
        return f"❌ Failed to mark message as not spam: {str(e)}"

# =============================================================================
# ADVANCED THREAD OPERATIONS
# =============================================================================

@tool
def mark_thread_important(thread_id: str) -> str:
    """Mark a specific thread as important."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/important")
        return f"✅ Thread {thread_id} marked as important"
    except GmailError as e:
        return f"❌ Failed to mark thread as important: {str(e)}"

@tool
def mark_thread_not_important(thread_id: str) -> str:
    """Mark a specific thread as not important."""
    try:
        _make_gmail_request("DELETE", f"/api/threads/{thread_id}/important")
        return f"✅ Thread {thread_id} marked as not important"
    except GmailError as e:
        return f"❌ Failed to mark thread as not important: {str(e)}"

@tool
def mark_thread_spam(thread_id: str) -> str:
    """Mark a specific thread as spam."""
    try:
        _make_gmail_request("POST", f"/api/threads/{thread_id}/spam")
        return f"✅ Thread {thread_id} marked as spam"
    except GmailError as e:
        return f"❌ Failed to mark thread as spam: {str(e)}"

@tool
def mark_thread_not_spam(thread_id: str) -> str:
    """Mark a specific thread as not spam."""
    try:
        _make_gmail_request("DELETE", f"/api/threads/{thread_id}/spam")
        return f"✅ Thread {thread_id} marked as not spam"
    except GmailError as e:
        return f"❌ Failed to mark thread as not spam: {str(e)}"

# =============================================================================
# ADVANCED LABEL OPERATIONS
# =============================================================================

@tool
def find_label_by_name(label_name: str) -> str:
    """Find a label by its name."""
    try:
        result = _make_gmail_request("GET", f"/api/labels/find", params={"name": label_name})
        
        if result.get("label"):
            label = result["label"]
            return f"""
📝 Label Found:
Name: {label.get('name', 'Unknown')}
ID: {label.get('id', 'Unknown')}
Type: {label.get('type', 'Unknown')}
"""
        else:
            return f"❌ Label '{label_name}' not found"
    except GmailError as e:
        return f"❌ Failed to find label: {str(e)}"

@tool
def get_or_create_label(label_name: str) -> str:
    """Get an existing label or create it if it doesn't exist."""
    try:
        result = _make_gmail_request("POST", "/api/labels/get-or-create", {
            "name": label_name
        })
        
        label = result.get("label", {})
        action = "found" if label.get("id") else "created"
        
        return f"""
✅ Label {action}:
Name: {label.get('name', 'Unknown')}
ID: {label.get('id', 'Unknown')}
Type: {label.get('type', 'Unknown')}
"""
    except GmailError as e:
        return f"❌ Failed to get or create label: {str(e)}"

# List of all Gmail tools for easy import
GMAIL_TOOLS = [
    # Basic email operations
    send_gmail,
    send_gmail_with_attachments,
    list_gmail_messages,
    read_gmail_message,
    reply_to_gmail,
    search_gmail,
    check_gmail_service_status,
    
    # Advanced message operations
    mark_message_read,
    mark_message_unread,
    archive_message,
    unarchive_message,
    trash_message,
    untrash_message,
    delete_message,
    search_messages,
    mark_message_important,
    mark_message_not_important,
    mark_message_spam,
    mark_message_not_spam,
    
    # Thread operations
    list_threads,
    get_thread_details,
    search_threads,
    mark_thread_read,
    mark_thread_unread,
    archive_thread,
    unarchive_thread,
    trash_thread,
    untrash_thread,
    delete_thread,
    mark_thread_important,
    mark_thread_not_important,
    mark_thread_spam,
    mark_thread_not_spam,
    
    # Label operations
    list_labels,
    get_label_details,
    create_label,
    apply_labels_to_message,
    remove_labels_from_message,
    apply_labels_to_thread,
    remove_labels_from_thread,
    find_label_by_name,
    get_or_create_label
]

# Tool descriptions for the agent
GMAIL_TOOL_DESCRIPTIONS = {
    # Basic email operations
    "send_gmail": "Send emails to recipients with subject and body",
    "send_gmail_with_attachments": "Send emails with file attachments",
    "list_gmail_messages": "List recent emails in the inbox",
    "read_gmail_message": "Read the full content of a specific email",
    "reply_to_gmail": "Reply to a specific email message",
    "search_gmail": "Search through emails using Gmail search syntax",
    "check_gmail_service_status": "Check if Gmail service is running",
    
    # Advanced message operations
    "mark_message_read": "Mark a specific message as read",
    "mark_message_unread": "Mark a specific message as unread",
    "archive_message": "Archive a specific message",
    "unarchive_message": "Unarchive a specific message",
    "trash_message": "Move a specific message to trash",
    "untrash_message": "Restore a specific message from trash",
    "delete_message": "Permanently delete a specific message",
    "search_messages": "Search messages with Gmail query syntax",
    "mark_message_important": "Mark a specific message as important",
    "mark_message_not_important": "Mark a specific message as not important",
    "mark_message_spam": "Mark a specific message as spam",
    "mark_message_not_spam": "Mark a specific message as not spam",
    
    # Thread operations
    "list_threads": "List Gmail conversation threads",
    "get_thread_details": "Get details of a specific thread",
    "search_threads": "Search threads with Gmail query syntax",
    "mark_thread_read": "Mark a specific thread as read",
    "mark_thread_unread": "Mark a specific thread as unread",
    "archive_thread": "Archive a specific thread",
    "unarchive_thread": "Unarchive a specific thread",
    "trash_thread": "Move a specific thread to trash",
    "untrash_thread": "Restore a specific thread from trash",
    "delete_thread": "Permanently delete a specific thread",
    "mark_thread_important": "Mark a specific thread as important",
    "mark_thread_not_important": "Mark a specific thread as not important",
    "mark_thread_spam": "Mark a specific thread as spam",
    "mark_thread_not_spam": "Mark a specific thread as not spam",
    
    # Label operations
    "list_labels": "List all Gmail labels",
    "get_label_details": "Get details of a specific label",
    "create_label": "Create a new Gmail label",
    "apply_labels_to_message": "Apply labels to a specific message",
    "remove_labels_from_message": "Remove labels from a specific message",
    "apply_labels_to_thread": "Apply labels to a specific thread",
    "remove_labels_from_thread": "Remove labels from a specific thread",
    "find_label_by_name": "Find a label by its name",
    "get_or_create_label": "Get an existing label or create it if it doesn't exist"
}
