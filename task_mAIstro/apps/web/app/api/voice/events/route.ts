import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { getEmailAccountFromParams } from '@/utils/email-account';
import { voiceEvents } from '@/utils/voice-events';

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

  // Verify user has access to this email account
  try {
    await getEmailAccountFromParams({ emailAccountId }, session.user.id);
  } catch (error) {
    return new NextResponse('Email account not found', { status: 404 });
  }

  const clientId = `${emailAccountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      // Add client to event emitter
      voiceEvents.addClient(clientId, controller);
      
      // Send initial connection event
      const welcomeMessage = `data: ${JSON.stringify({
        type: 'connection_established',
        data: { 
          clientId, 
          emailAccountId,
          message: 'Voice events stream connected' 
        },
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage));

      // Send periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({
            type: 'heartbeat',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch (error) {
          clearInterval(heartbeatInterval);
          voiceEvents.removeClient(clientId);
        }
      }, 30000); // 30 second heartbeat

      // Store interval reference for cleanup
      (controller as any).heartbeatInterval = heartbeatInterval;
    },
    
    cancel() {
      // Cleanup when stream is cancelled
      voiceEvents.removeClient(clientId);
      if ((this as any).heartbeatInterval) {
        clearInterval((this as any).heartbeatInterval);
      }
    }
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
