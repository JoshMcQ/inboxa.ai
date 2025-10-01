import { NextRequest, NextResponse } from "next/server";

// ElevenLabs webhook handler that bridges to your LangGraph system
export async function POST(request: NextRequest) {
  try {
    console.log('ElevenLabs webhook called');
    
    // Parse the webhook payload from ElevenLabs
    const body = await request.json();
    console.log('ElevenLabs payload:', JSON.stringify(body, null, 2));
    
    // Extract the user message and context from ElevenLabs
    const userMessage = body.message || body.text || body.query || "";
    const conversationId = body.conversation_id || body.session_id;
    // Optional timezone from ElevenLabs dynamic variables or payload
    const userTimezone =
      body.timezone || body.time_zone || body.dynamic_variables?.timezone || body.dynamic_variables?.time_zone;
    
    // Get dynamic variables passed from the widget
    // ElevenLabs sends these directly in the webhook body at root level
    const emailAccountId = body.email_account_id || body.dynamic_variables?.email_account_id;
    const userId = body.user_id || body.dynamic_variables?.user_id;
    
    // Log what we received for debugging
    console.log('Dynamic variables received:', { email_account_id: body.email_account_id, user_id: body.user_id });
    console.log('Extracted:', { userMessage, emailAccountId, userId, conversationId });
    
    if (!userMessage) {
      return NextResponse.json({ 
        error: "No message provided" 
      }, { status: 400 });
    }

    // Forward to our internal API endpoint that handles authentication
    const internalApiUrl = `http://localhost:3001/api/internal/langgraph`;
    
    const internalPayload = {
      userMessage,
      emailAccountId: emailAccountId || "cmej6xrtq0004t2ukwvgm0ux6", // fallback for testing
      userId: userId || "cmej6xrig0000t2uk0jppbmw3", // fallback for testing
      conversationId,
      userTimezone,
      fastLaneMode: "full",
    };

    console.log('Calling internal API with:', JSON.stringify(internalPayload, null, 2));

    // Call our internal authenticated API
    const response = await fetch(internalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(internalPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Internal API error:', response.status, errorText);
      return NextResponse.json({
        response: "I'm having trouble accessing your email system right now. Please try again in a moment."
      });
    }

    const result = await response.json();
    console.log('Internal API response:', result);

    const responseText = (result.response as string) || "I understand. Let me help you with that.";
    console.log('Returning response to ElevenLabs', {
      conversationId,
      emailAccountId,
      userId,
      fast: result.fast ?? false,
      response: responseText,
    });

    // Return response in format ElevenLabs expects (full text)
    return NextResponse.json({
      response: responseText,
      conversation_id: conversationId
    });

  } catch (error) {
    console.error('ElevenLabs webhook error:', error);
    return NextResponse.json({
      response: "I'm experiencing some technical difficulties. Please try again."
    }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    status: "ElevenLabs webhook endpoint active",
    timestamp: new Date().toISOString()
  });
}
