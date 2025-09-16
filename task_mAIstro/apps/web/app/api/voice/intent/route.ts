import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { getEmailAccountFromParams } from '@/utils/email-account';
import { emitVoiceEvent, emitAgentStep } from '@/utils/voice-events';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IntentRequest {
  transcript: string;
  emailAccountId: string;
  context?: {
    currentView?: string;
    selectedEmails?: string[];
    recentActions?: any[];
  };
}

interface IntentResponse {
  intent: {
    type: string;
    confidence: number;
    parameters: any;
    description: string;
    actionable: boolean;
  };
  suggestions?: string[];
  needsConfirmation?: boolean;
  confirmationMessage?: string;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body: IntentRequest = await request.json();
    const { transcript, emailAccountId, context } = body;

    // Verify user has access to this email account
    const emailAccount = await getEmailAccountFromParams(
      { emailAccountId }, 
      session.user.id
    );

    // Emit processing start event
    emitAgentStep(emailAccountId, {
      id: `intent-${Date.now()}`,
      type: 'intent_parsing',
      status: 'in_progress',
      query: transcript
    });

    // Use OpenAI for sophisticated intent parsing
    const intentResult = await parseIntentWithAI(transcript, context);

    // Emit completion event
    emitAgentStep(emailAccountId, {
      id: `intent-${Date.now()}`,
      type: 'intent_parsing',
      status: 'completed',
      confidence: intentResult.intent.confidence
    });

    // Emit intent event for real-time UI updates
    emitVoiceEvent(emailAccountId, {
      type: 'agent_step',
      data: {
        type: 'intent_parsed',
        intent: intentResult.intent,
        transcript: transcript,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(intentResult);

  } catch (error) {
    console.error('Voice intent parsing error:', error);
    // best-effort emit if body is available
    try {
      const maybeBody = (await request.clone().json()) as Partial<IntentRequest>;
      emitVoiceEvent(maybeBody?.emailAccountId || '', {
        type: 'agent_step',
        data: {
          type: 'intent_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch {}

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to parse intent' 
      },
      { status: 500 }
    );
  }
}

async function parseIntentWithAI(transcript: string, context?: any): Promise<IntentResponse> {
  const systemPrompt = `You are an AI assistant that parses voice commands for email management. 
  
  Parse the user's voice command and return a structured intent with these possible types:
  - search: Find specific emails
  - compose: Write new email
  - reply: Reply to email
  - forward: Forward email
  - archive: Archive emails
  - delete: Delete emails  
  - schedule: Schedule emails or reminders
  - label: Apply labels/categories
  - star: Mark as important
  - unsubscribe: Unsubscribe from senders
  - bulk_action: Bulk operations
  - navigation: Navigate to different views
  - filter: Apply filters
  - unknown: Cannot determine intent

  Return JSON with:
  {
    "intent": {
      "type": "string",
      "confidence": 0.0-1.0,
      "parameters": {
        "query": "search terms",
        "recipients": ["email@example.com"],
        "subject": "email subject",
        "content": "email body",
        "emailIds": ["id1", "id2"],
        "labels": ["label1"],
        "scheduleTime": "time specification",
        "filter": {
          "sender": "sender email",
          "subject": "subject filter",
          "isUnread": true/false,
          "hasAttachment": true/false,
          "dateRange": "time range"
        }
      },
      "description": "Human-readable description of what the user wants to do",
      "actionable": true/false
    },
    "suggestions": ["suggestion1", "suggestion2"],
    "needsConfirmation": true/false,
    "confirmationMessage": "What to ask user to confirm"
  }

  Context information:
  ${context ? JSON.stringify(context, null, 2) : 'No context provided'}
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Parse this voice command: "${transcript}"`
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content;
  
  if (!response) {
    throw new Error('No response from AI intent parser');
  }

  try {
    return JSON.parse(response);
  } catch (parseError) {
    console.error('Failed to parse AI response:', response);
    
    // Fallback intent for unparseable responses
    return {
      intent: {
        type: 'unknown',
        confidence: 0.1,
        parameters: {},
        description: `Could not parse command: "${transcript}"`,
        actionable: false
      },
      suggestions: [
        'Try rephrasing your command',
        'Use specific keywords like "search", "delete", or "compose"'
      ]
    };
  }
}

// GET endpoint for intent history and analytics
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const emailAccountId = searchParams.get('emailAccountId');
  
  if (!emailAccountId) {
    return new NextResponse('Email account ID required', { status: 400 });
  }

  try {
    // Verify access
    await getEmailAccountFromParams({ emailAccountId }, session.user.id);

    // In a real implementation, you would fetch from database
    // For now, return mock analytics
    const analytics = {
      totalIntents: 0,
      intentTypes: {},
      averageConfidence: 0,
      successRate: 0,
      recentIntents: []
    };

    return NextResponse.json(analytics);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch intent analytics' },
      { status: 500 }
    );
  }
}
