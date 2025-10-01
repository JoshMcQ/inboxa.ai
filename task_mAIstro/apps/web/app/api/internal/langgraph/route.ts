import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { getGmailClientForEmail } from "@/utils/account";
import { queryBatchMessages, getMessage } from "@/utils/gmail/message";
import { parseMessage } from "@/utils/mail";

// In-memory selection cache keyed by conversationId and fallback by user+account
// Stores the last selected messageId for follow-up commands like "read it"
const lastSelectionByConversation = new Map<string, { messageId: string; at: number }>();
const lastSelectionByUserAccount = new Map<string, { messageId: string; at: number }>();
const SELECTION_TTL_MS = 10 * 60 * 1000; // 10 minutes

function saveSelection(conversationId: string | undefined, messageId: string | undefined, userKey?: string) {
  if (!conversationId || !messageId) return;
  lastSelectionByConversation.set(conversationId, { messageId, at: Date.now() });
  if (userKey) lastSelectionByUserAccount.set(userKey, { messageId, at: Date.now() });
}

function loadSelection(conversationId: string | undefined, userKey?: string): string | null {
  if (!conversationId) return null;
  const entry = lastSelectionByConversation.get(conversationId);
  if (!entry) return null;
  if (Date.now() - entry.at > SELECTION_TTL_MS) {
    lastSelectionByConversation.delete(conversationId);
    return null;
  }
  return entry.messageId;
}

function loadSelectionFallback(userKey?: string): string | null {
  if (!userKey) return null;
  const entry = lastSelectionByUserAccount.get(userKey);
  if (!entry) return null;
  if (Date.now() - entry.at > SELECTION_TTL_MS) {
    lastSelectionByUserAccount.delete(userKey);
    return null;
  }
  return entry.messageId;
}

// Internal API endpoint for authenticated LangGraph calls
// This endpoint handles authentication using emailAccountId and userId directly from the database
export async function POST(request: NextRequest) {
  try {
    console.log('Internal LangGraph endpoint called');
    
    const body = await request.json();
    console.log('Internal payload:', JSON.stringify(body, null, 2));
    
    const { userMessage, emailAccountId, userId, conversationId, userTimezone, fastLaneMode } = body;
    
    if (!userMessage || !emailAccountId || !userId) {
      console.error('Missing required fields:', { userMessage: !!userMessage, emailAccountId: !!emailAccountId, userId: !!userId });
      return NextResponse.json({ 
        error: "Missing required fields: userMessage, emailAccountId, userId",
        received: { userMessage: !!userMessage, emailAccountId: !!emailAccountId, userId: !!userId }
      }, { status: 400 });
    }

    // Verify the emailAccountId belongs to the userId
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { 
        id: emailAccountId,
        userId: userId 
      },
      select: { 
        id: true,
        email: true,
        userId: true,
        account: {
          select: { 
            access_token: true, 
            refresh_token: true, 
            expires_at: true 
          }
        }
      },
    });

    if (!emailAccount) {
      console.error('Email account not found or unauthorized:', { emailAccountId, userId });
      return NextResponse.json({ 
        error: "Email account not found or unauthorized" 
      }, { status: 403 });
    }

    console.log('Email account verified:', emailAccount.email);

    // Handle follow-up pronoun like "read it" using last selected message
    const userKey = `${userId}:${emailAccountId}`;
    if (isFollowUpRead(userMessage)) {
      let selectedId = loadSelection(conversationId, userKey);
      if (!selectedId) selectedId = loadSelectionFallback(userKey);
      if (selectedId) {
        const gmail = await getGmailClientForEmail({ emailAccountId });
        const full = await getMessage(selectedId, gmail, 'full');
        const parsed = parseMessage(full);
        const from = parsed.headers.from || 'Unknown';
        const subject = parsed.headers.subject || 'No subject';
        const date = parsed.headers.date || '';
        const bodyText = (parsed.textPlain || parsed.textHtml || parsed.snippet || '').toString();
        const result = `Reading the selected email:\n\nFrom: ${from}\nSubject: ${subject}\nDate: ${date}\n\n${bodyText}`;
        return NextResponse.json({ response: result, conversation_id: conversationId, fast: true });
      }
      // No selection stored; proceed to normal flow
    }

    // Parse intent for deterministic hints; always pass hints to LangGraph.
    // We disable fast lane here for reliability unless explicitly enabled.
    const FAST_LANE_MODE = (fastLaneMode as string | undefined)?.toLowerCase() || process.env.FAST_LANE_MODE || 'off'; // off | precise_only | full
    const parsed = parseFastIntent(userMessage);
    let hints: any = {};
    if (parsed) {
      const tz = userTimezone || process.env.TZ || 'UTC';
      const toLocal = (date: Date) => new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const fmt = (d: Date) => `${d.getUTCFullYear()}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCDate().toString().padStart(2, '0')}`;
      let start: Date | undefined; let end: Date | undefined;
      if (parsed.day) {
        const now = new Date();
        const todayLocal = toLocal(now);
        const zero = new Date(Date.UTC(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate()));
        start = new Date(zero);
        if (parsed.day === 'yesterday') start.setUTCDate(start.getUTCDate() - 1);
        end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
      } else if (parsed.explicitDate) {
        const base = new Date();
        const year = parsed.explicitDate.year ?? toLocal(base).getFullYear();
        const local = new Date(`${year}-${String(parsed.explicitDate.month).padStart(2,'0')}-${String(parsed.explicitDate.day).padStart(2,'0')}T00:00:00`);
        const locAdj = toLocal(local);
        start = new Date(Date.UTC(locAdj.getFullYear(), locAdj.getMonth(), locAdj.getDate()));
        end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
      }
      if (start && end) {
        hints.after_date = fmt(start);
        hints.before_date = fmt(end);
      }
      if (parsed.senderText) hints.sender_hint = parsed.senderText;
    }

    // Optional fast lane for precise_only/full modes
    if (FAST_LANE_MODE !== 'off') {
      const fast = await tryFastEmailLookup({
        userMessage,
        emailAccountId,
        userEmail: emailAccount.email,
        userTimezone: userTimezone || process.env.TZ || 'UTC',
        conversationId,
        userKey,
      });
      if (fast) {
        console.log('[Voice][FastLane] HIT', {
          mode: FAST_LANE_MODE,
          userId,
          emailAccountId,
          conversationId,
          query: userMessage,
        });
        return NextResponse.json({ response: fast, conversation_id: conversationId, fast: true });
      }
      console.log('[Voice][FastLane] MISS', {
        mode: FAST_LANE_MODE,
        userId,
        emailAccountId,
        conversationId,
        query: userMessage,
      });
    }

    // Forward to LangGraph system with authentication context
    const langgraphUrl = process.env.LANGGRAPH_URL || "http://localhost:2024";
    
    const langgraphPayload = {
      assistant_id: "task_maistro",
      input: {
        messages: [{ role: "human", content: userMessage }]
      },
      config: {
        configurable: {
          user_id: userId,
          email_account_id: emailAccountId,
          // Use base origin without /api to avoid double-prefixing
          api_base_url: (process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3001"),
          user_timezone: userTimezone || process.env.TZ || "UTC",
          hints,
          // Create a simple auth token for internal API calls
          internal_auth: JSON.stringify({
            userId: userId,
            emailAccountId: emailAccountId,
            email: emailAccount.email,
            accessToken: emailAccount.account?.access_token,
            refreshToken: emailAccount.account?.refresh_token,
            expiresAt: emailAccount.account?.expires_at
          }),
          todo_category: "general",
          task_maistro_role: "You are Joshua's personal email assistant with a friendly, conversational personality. Be EXTREMELY persistent and thorough when searching emails - never give up after just one search attempt. When a search fails, immediately try multiple variations like partial names, keywords, subject terms, different spellings. For example, if searching for 'Man Cave' fails, try 'mancave', 'barber', 'haircut', 'appointment', 'confirmation', etc. Always try at least 3-5 different search approaches before saying you can't find something. Be proactive and determined - Joshua's emails contain the answers, you just need to search smarter. CRITICAL: When you find emails in search results, ALWAYS use the exact Message ID provided (like '198f0f3df27948d6') with read_gmail_message() to get the full email content. NEVER use numbers like '1' or '2' - always use the actual Message ID from the search results. The search results will show 'Message ID: [actual_id]' - use that exact ID. Keep responses natural and conversational.",
          conversation_id: conversationId
        }
      },
      stream_mode: "values",
      enable_voice: false
    };

    console.log('[Voice][LangGraph] Calling graph', {
      userId,
      emailAccountId,
      conversationId,
      query: userMessage,
      hints,
    });

    // Call LangGraph system
    const response = await fetch(`${langgraphUrl}/runs/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(langgraphPayload),
    });

    if (!response.ok) {
      console.error('LangGraph error:', response.status, response.statusText);
      return NextResponse.json({
        error: "LangGraph service error",
        status: response.status
      }, { status: 502 });
    }

    // Parse the streaming response from LangGraph
    let fullResponse = "";
    let lastError = null;
    const reader = response.body?.getReader();
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            console.log('LangGraph chunk:', JSON.stringify(data, null, 2));
            
            if (data.messages && data.messages.length > 0) {
              const lastMessage = data.messages[data.messages.length - 1];
              if (lastMessage.role === 'assistant' || lastMessage.type === 'ai') {
                fullResponse = lastMessage.content || "";
              }
            }
            
            // Check for errors in the stream
            if (data.error) {
              lastError = data.error;
              console.error('LangGraph stream error:', data.error);
            }
          } catch (e) {
            const error = e as Error;
            console.warn('Failed to parse LangGraph chunk:', line.substring(0, 100), error.message);
          }
        }
      }
    }

    console.log('[Voice][LangGraph] Final response', {
      userId,
      emailAccountId,
      conversationId,
      response: fullResponse,
      lastError,
    });
    
    // If there was an error but we got some response, include both
    if (lastError && fullResponse) {
      console.warn('LangGraph completed with error:', lastError);
    } else if (lastError) {
      console.error('LangGraph failed with error:', lastError);
      return NextResponse.json({
        response: "I'm experiencing some technical difficulties with email processing. Please try again.",
        error: lastError,
        conversation_id: conversationId
      });
    }

    return NextResponse.json({
      response: fullResponse || "I understand. Let me help you with that.",
      conversation_id: conversationId
    });

  } catch (error) {
    console.error('Internal LangGraph API error:', error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// ------- Fast lane helpers -------
function parseFastIntent(message: string): null | {
  senderText?: string; // raw text after 'from', may be brand name
  day?: 'today' | 'yesterday';
  explicitDate?: { year?: number; month: number; day: number };
} {
  const m = (message || '').toLowerCase();
  // capture after 'from' up to 'today/yesterday' or end
  let senderText: string | undefined;
  const fromMatch = m.match(/from\s+(.+?)(?:\s+(?:today|yesterday)\b|$)/);
  if (fromMatch) senderText = fromMatch[1].trim();
  // normalize multiple spaces
  if (senderText) senderText = senderText.replace(/\s+/g, ' ').trim();

  const day: 'today' | 'yesterday' | undefined = m.includes('yesterday') ? 'yesterday' : (m.includes('today') ? 'today' : undefined);

  // explicit date like 'on the 13th of september' or 'september 13th' (optional year)
  let explicitDate: { year?: number; month: number; day: number } | undefined;
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const monthRegex = months.join('|');
  const ordinal = '(?:st|nd|rd|th)?';
  const re1 = new RegExp(`(?:on\\s+)?(\\d{1,2})${ordinal}\\s+of\\s+(${monthRegex})(?:\\s+(\\d{4}))?`);
  const re2 = new RegExp(`(${monthRegex})\\s+(\\d{1,2})${ordinal}(?:,?\\s*(\\d{4}))?`);
  let mm: RegExpMatchArray | null = m.match(re1) || m.match(re2);
  if (mm) {
    let monthName: string;
    let dayStr: string;
    let yearStr: string | undefined;
    if (mm[2] && mm[1]) { // re1: day, month, year?
      dayStr = mm[1]; monthName = mm[2]; yearStr = mm[3];
    } else { // re2: month, day, year?
      monthName = mm[1]; dayStr = mm[2]; yearStr = mm[3];
    }
    const month = months.indexOf(monthName) + 1;
    const dayNum = parseInt(dayStr, 10);
    const yearNum = yearStr ? parseInt(yearStr, 10) : undefined;
    if (!isNaN(month) && month > 0 && dayNum > 0) explicitDate = { year: yearNum, month, day: dayNum };
  }

  if (!senderText && !day && !explicitDate) return null;
  return { senderText, day, explicitDate };
}

function isFollowUpRead(message: string): boolean {
  const m = (message || '').toLowerCase().trim();
  if (!m) return false;
  const exact = new Set([
    'read it',
    'read the email',
    'read that',
    'read',
    'read it out loud',
    'read out loud',
    'continue',
    'keep reading',
    'finish reading',
    'read full email',
    'read the full email',
    'read the rest',
    'read the rest of it',
    'read the rest please',
  ]);
  if (exact.has(m)) return true;
  // fuzzy patterns
  if (m.startsWith('read the rest')) return true;
  if (m.startsWith('read full')) return true;
  if (m.includes('read') && m.includes('rest')) return true;
  if (m.includes('read') && m.includes('full')) return true;
  if (m.includes('continue') || m.includes('keep reading') || m.includes('finish')) return true;
  return false;
}

async function tryFastEmailLookup({
  userMessage,
  emailAccountId,
  userEmail,
  userTimezone,
  conversationId,
  userKey,
}: {
  userMessage: string;
  emailAccountId: string;
  userEmail: string;
  userTimezone: string;
  conversationId?: string;
  userKey?: string;
}): Promise<string | null> {
  const intent = parseFastIntent(userMessage);
  if (!intent) return null;
  try {
    const gmail = await getGmailClientForEmail({ emailAccountId });

    const tz = userTimezone || 'UTC';
    const toLocal = (date: Date) => new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const fmt = (d: Date) => `${d.getUTCFullYear()}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCDate().toString().padStart(2, '0')}`;

    let query = '';
    // Build a date window if day or explicitDate provided
    let start: Date | undefined;
    let end: Date | undefined;
    if (intent.day) {
      const now = new Date();
      const todayLocal = toLocal(now);
      const zero = new Date(Date.UTC(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate()));
      start = new Date(zero);
      if (intent.day === 'yesterday') start.setUTCDate(start.getUTCDate() - 1);
      end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
    } else if (intent.explicitDate) {
      const ref = new Date();
      const year = intent.explicitDate.year ?? toLocal(ref).getFullYear();
      const local = new Date(`${year}-${String(intent.explicitDate.month).padStart(2,'0')}-${String(intent.explicitDate.day).padStart(2,'0')}T00:00:00`);
      const locAdj = toLocal(local);
      start = new Date(Date.UTC(locAdj.getFullYear(), locAdj.getMonth(), locAdj.getDate()));
      end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
    }

    // Determine sender token
    const senderText = intent.senderText?.trim();
    const looksLikeDomain = !!senderText && /[@.]/.test(senderText);

    // Primary queries
    const queries: string[] = [];
    const window = start && end ? `after:${fmt(start)} before:${fmt(end)} ` : '';
    if (senderText) {
      if (looksLikeDomain) {
        queries.push(`${window}from:${senderText} label:INBOX`.trim());
      } else {
        // Discovery: try from:token, then keyword search
        queries.push(`${window}from:${senderText} label:INBOX`.trim());
        queries.push(`${window}"${senderText}" label:INBOX`.trim());
      }
    } else if (window) {
      queries.push(`${window}label:INBOX`.trim());
    }

    let hitId: string | undefined;
    let lastQueryTried = '';
    for (const q of queries) {
      lastQueryTried = q;
      const { messages } = await queryBatchMessages(gmail, { query: q, maxResults: 1 });
      if (messages && messages.length > 0 && messages[0].id) { hitId = messages[0].id; break; }
    }
    if (!hitId) {
      return null;
    }
    const full = await getMessage(hitId, gmail, 'full');
    const parsed = parseMessage(full);
    const headerDate = parsed.headers.date || '';
    const from = parsed.headers.from || 'Unknown';
    const subject = parsed.headers.subject || 'No subject';
    const body = parsed.textPlain || parsed.textHtml || parsed.snippet || '';
    // Save selection for follow-ups like "read it"
    saveSelection(conversationId, hitId, userKey);

    const summary = `Here’s the ${intent.day ? intent.day : (intent.explicitDate ? 'requested' : 'recent')} email${senderText ? ` from ${senderText}` : ''}:

From: ${from}
Subject: ${subject}
Date: ${headerDate}

${body.substring(0, 1200)}`;
    return summary;
  } catch (e) {
    console.error('Fast lookup failed:', e);
    return null;
  }
}
