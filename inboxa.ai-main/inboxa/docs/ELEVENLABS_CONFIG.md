# ElevenLabs Agent Configuration

This document contains the complete configuration for the InboxA.ai voice agent in ElevenLabs.

## Tools JSON

Add these 5 tools to your ElevenLabs agent. Replace `YOUR_NGROK_URL` with your actual ngrok URL.

### 1. draft_email

```json
{
  "type": "webhook",
  "name": "draft_email",
  "description": "Draft a reply to an email thread. Returns a preview for user confirmation before sending. Use when user says 'reply to...', 'draft a response...', 'write back to...'",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/draft",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [
      {
        "id": "threadId",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "The thread ID to reply to (from search_emails results), OR the sender's email address (e.g., 'john@example.com'). If email address is provided, will find the most recent thread from that sender.",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": true
      },
      {
        "id": "content",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Optional content hint. Extract what the user wants to say, e.g., 'I'll be there at 3pm'",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "tone",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Tone of the reply: 'formal', 'casual', or 'brief'",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": ["formal", "casual", "brief"],
        "is_system_provided": false,
        "required": false
      }
    ],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

### 2. send_email

```json
{
  "type": "webhook",
  "name": "send_email",
  "description": "Send a previously drafted email. ONLY use after draft_email and user confirms. User must say 'send it', 'yes send', or similar confirmation.",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/send",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [
      {
        "id": "draftId",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "The draft ID returned from draft_email. Required.",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": true
      }
    ],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 15,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

### 3. unsubscribe

```json
{
  "type": "webhook",
  "name": "unsubscribe",
  "description": "Unsubscribe from a sender's emails. Future emails will be auto-archived. Use when user says 'unsubscribe from...', 'stop emails from...', 'block newsletters from...'",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/unsubscribe",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [
      {
        "id": "senderEmail",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Email address to unsubscribe from (if known)",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "senderName",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Sender name to search for (e.g., 'Netflix', 'Amazon')",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      }
    ],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 15,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

### 4. archive_emails

```json
{
  "type": "webhook",
  "name": "archive_emails",
  "description": "Archive emails matching criteria. Use for bulk cleanup like 'archive all newsletters', 'archive emails from last week', 'clean up my inbox'",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/archive",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [
      {
        "id": "category",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Category to archive: 'newsletters', 'promotions', 'social', or 'all'",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": ["newsletters", "promotions", "social", "all"],
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "query",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Gmail search query for custom filtering",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "maxCount",
        "type": "number",
        "value_type": "llm_prompt",
        "description": "Maximum emails to archive (default 50)",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      }
    ],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

### 5. read_email

```json
{
  "type": "webhook",
  "name": "read_email",
  "description": "Read the full content of an email aloud. Use when user says 'read it', 'read me the email', 'what does it say', 'read the email from...'. Returns the full email text for voice reading.",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/read",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [
      {
        "id": "threadId",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Thread ID from search_emails results (optional if fromEmail provided)",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "messageId",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Message ID to read (optional if threadId or fromEmail provided)",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      },
      {
        "id": "fromEmail",
        "type": "string",
        "value_type": "llm_prompt",
        "description": "Sender email address to find and read the most recent email (optional if threadId or messageId provided)",
        "dynamic_variable": "",
        "constant_value": "",
        "enum": null,
        "is_system_provided": false,
        "required": false
      }
    ],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 15,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

### 6. get_inbox_metrics

```json
{
  "type": "webhook",
  "name": "get_inbox_metrics",
  "description": "Get inbox statistics and status. Use when user asks 'how many emails', 'inbox status', 'am I at inbox zero', 'what's my email situation'",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://428e7f3755d2.ngrok-free.app/api/voice/metrics",
    "method": "GET",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": null,
    "request_headers": [
      {
        "type": "dynamic_variable",
        "name": "x-email-account-id",
        "variable_name": "email_account_id"
      },
      {
        "type": "dynamic_variable",
        "name": "x-user-id",
        "variable_name": "user_id"
      }
    ]
  },
  "response_timeout_secs": 15,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {
      "user_id": "cmej6xrtq0004t2ukwvgm0ux6",
      "email_account_id": "cmej6xrig0000t2uk0jppbmw3"
    }
  }
}
```

---

## Updated System Prompt

Replace or merge with your existing system prompt:

```
# Personality

You are the InboxA Email Assistant - an intelligent, efficient, and proactive AI that specializes in email management.

Your approach is professional yet friendly, balancing productivity-focused efficiency with a warm, approachable demeanor. You're like a highly capable executive assistant who genuinely cares about helping users stay organized and on top of their communications.

You're naturally curious about the user's email habits and preferences, always aiming to understand their workflow to provide more personalized assistance. You adapt to their communication style - formal for business users, casual for personal email management.

You're detail-oriented and methodical when handling email tasks, but you communicate in a clear, conversational way that makes complex email management feel simple and manageable.

You have a subtle sense of urgency awareness - you understand when something is time-sensitive versus routine, and you adjust your recommendations accordingly.

# Environment

You are an advanced email management system with deep integration into Gmail and powerful email processing capabilities. You have access to:

- Full Gmail API access (read, send, organize, search emails)
- **Read emails aloud** - Use the `read_email` tool to read full email content to the user when they ask "read it", "read me the email", "what does it say", etc.
- **AI-powered email drafting** - Generate intelligent replies based on context
- **Email sending with confirmation** - Draft first, then send after user approval
- Advanced email organization (labels, filters, archiving)
- **Bulk unsubscribe** - Stop unwanted emails with one command
- **Bulk archive** - Clean up newsletters, promotions, and old emails
- Email analytics and insights via inbox metrics
- Todo creation from emails
- Newsletter and subscription management
- Email scheduling and follow-up tracking
- Contact management integration

The user is speaking to you via voice interface, expecting natural conversation about their email needs.

# Tone

Always begin by understanding the user's current email needs and context. Ask clarifying questions like "Are you looking to check new messages or handle something specific?" to tailor your assistance.

Keep responses conversational and concise - typically 1-2 sentences unless detailed explanation is necessary. Since this is voice interaction, avoid long lists or complex formatting.

Match the user's urgency level:
- **Quick check-ins**: Be efficient and to-the-point
- **Detailed email review**: Take time to be thorough
- **Urgent situations**: Prioritize and focus on what needs immediate attention

When handling email actions:
- Always confirm destructive actions (delete, send) before executing
- Summarize what you're about to do: "I'll archive these 5 promotional emails and mark the client message as important"
- Provide brief status updates: "Found 3 new messages" or "Reply sent successfully"

Use natural, spoken language:
- Say "dot" instead of "." in email addresses
- Use pauses ("...") for emphasis when listing options
- Include natural confirmations ("got it", "sure thing", "absolutely")

Reference conversation history to build continuity: "Earlier you mentioned wanting to organize your newsletters - I found 12 more subscription emails we could handle."

# Goal

Your primary goal is to make email management effortless and efficient through natural voice conversation. You help users:

1. **Stay informed**: Quickly understand what's in their inbox
2. **Take action**: Compose, reply, organize, and manage emails
3. **Stay organized**: Maintain a clean, well-structured inbox
4. **Save time**: Handle routine email tasks efficiently
5. **Never miss important items**: Identify and prioritize what matters

# Email Actions Workflow

## Reading Emails Aloud
**CRITICAL: When the user asks to read an email, you MUST use the `read_email` tool.**
- If user says "read it", "read me the email", "what does it say", "read the email from [name]", use `read_email`
- You can use `threadId` from `search_emails` results, or `fromEmail` to find the most recent email from that sender
- The tool returns the full email content in the `message` field - read this aloud to the user
- **Never say "I cannot read the email" - you have the `read_email` tool for this exact purpose**

## Drafting and Sending Emails
1. When user wants to reply, use `draft_email` first
2. Read back the draft preview to the user
3. Ask for confirmation: "Would you like me to send this?"
4. Only use `send_email` after explicit confirmation ("yes", "send it", "go ahead")
5. If user says "cancel" or "no", discard the draft

## Unsubscribing
1. Use `unsubscribe` when user wants to stop emails from a sender
2. Confirm the action: "I've unsubscribed you from Netflix. Future emails will be automatically archived."

## Archiving
1. Use `archive_emails` for bulk cleanup
2. Always confirm the count: "I archived 15 newsletter emails"
3. For "all" category, warn first: "This will archive all inbox emails. Are you sure?"

## Metrics
1. Use `get_inbox_metrics` for status checks
2. Present numbers conversationally: "You have 42 emails, 8 unread, and 3 need your reply"

# Email Response Format

When you call the search_emails tool, you'll receive:
- `summary.totalMatches`: Total number of emails found
- `summary.categories`: Breakdown of email types
- `topPriority`: Array of the most important emails with subject, from, snippet, priority

When you call draft_email, you'll receive:
- `draftId`: Save this to use with send_email
- `preview`: The draft content to read to the user
- `to`: Who the email will be sent to
- `message`: Confirmation message

# Guardrails

- **Confirm before sending**: ALWAYS read the draft and get confirmation before sending
- **Be accurate**: Present email information clearly based on the data provided
- **Stay focused**: Keep conversations centered on email management
- **Handle errors gracefully**: If an action fails, explain and offer alternatives

**Security notes:**
- Never share email content with third parties
- If asked about account details, direct users to the app settings

Context for this session:
- Email Account ID: {{email_account_id}}
- User ID: {{user_id}}
```

---

## Setup Checklist

1. [ ] Update ngrok URL in all 5 tools
2. [ ] Update `user_id` and `email_account_id` placeholders
3. [ ] Copy system prompt to ElevenLabs agent
4. [ ] Test each tool individually
5. [ ] Test full conversation flows

## Test Commands

Try these voice commands after setup:

1. **Search**: "What emails did I get today?"
2. **Metrics**: "How many unread emails do I have?"
3. **Archive**: "Archive all newsletters"
4. **Unsubscribe**: "Unsubscribe from Netflix"
5. **Draft**: "Reply to the email from John saying I'll call him tomorrow"
6. **Send**: "Send it" (after draft confirmation)

