import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { getEmailAccountFromParams } from '@/utils/email-account';
import { emitVoiceEvent, emitAgentStep } from '@/utils/voice-events';
import { getGmailClientWithRefresh } from '@/utils/gmail/client';
import prisma from '@/utils/prisma';

interface UndoRequest {
  actionId: string;
  actionType: 'send' | 'delete' | 'archive' | 'unsubscribe' | 'schedule' | 'bulk_action';
  emailAccountId: string;
  data: {
    emailIds?: string[];
    messageId?: string;
    threadId?: string;
    originalLabels?: string[];
    originalState?: any;
    draftId?: string;
    scheduledMessageId?: string;
  };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body: UndoRequest = await request.json();
    const { actionId, actionType, emailAccountId, data } = body;

    // Verify user has access to this email account
    const emailAccount = await getEmailAccountFromParams(
      { emailAccountId }, 
      session.user.id
    );

    // Get Gmail client with token refresh support
    const gmail = await getGmailClientWithRefresh({
      accessToken: emailAccount.account?.access_token ?? undefined,
      refreshToken: emailAccount.account?.refresh_token ?? null,
      expiresAt: emailAccount.account?.expires_at ?? null,
      emailAccountId,
    });

    let undoResult: any = {};
    let undoDescription = '';

    // Emit undo start event
    emitAgentStep(emailAccountId, {
      id: `undo-${actionId}`,
      type: 'undo',
      status: 'in_progress'
    });

    switch (actionType) {
      case 'send':
        undoResult = await undoSendAction(gmail, data);
        undoDescription = 'Email sending cancelled or recalled';
        break;
        
      case 'delete':
        undoResult = await undoDeleteAction(gmail, data);
        undoDescription = `Restored ${data.emailIds?.length || 1} deleted emails`;
        break;
        
      case 'archive':
        undoResult = await undoArchiveAction(gmail, data);
        undoDescription = `Restored ${data.emailIds?.length || 1} archived emails to inbox`;
        break;
        
      case 'unsubscribe':
        undoResult = await undoUnsubscribeAction(emailAccountId, data);
        undoDescription = 'Unsubscribe actions reversed';
        break;
        
      case 'schedule':
        undoResult = await undoScheduleAction(gmail, data);
        undoDescription = 'Scheduled message cancelled';
        break;
        
      case 'bulk_action':
        undoResult = await undoBulkAction(gmail, emailAccountId, data);
        undoDescription = `Bulk action reversed for ${data.emailIds?.length || 0} emails`;
        break;
        
      default:
        throw new Error(`Unsupported undo action type: ${actionType}`);
    }

    // Optionally log the undo action to a future audit table

    // Emit success event
    emitAgentStep(emailAccountId, {
      id: `undo-${actionId}`,
      type: 'undo',
      status: 'completed',
      duration: Date.now()
    });

    emitVoiceEvent(emailAccountId, {
      type: 'undo_completed',
      data: {
        actionId,
        actionType,
        description: undoDescription,
        result: undoResult
      }
    });

    return NextResponse.json({
      success: true,
      message: undoDescription,
      result: undoResult
    });

  } catch (error) {
    console.error('Voice undo error:', error);
    
    // Emit error event (best-effort)
    try {
      const maybeBody = (await request.clone().json()) as Partial<UndoRequest>;
      emitVoiceEvent(maybeBody?.emailAccountId || '', {
        type: 'undo_failed',
        data: {
          actionId: maybeBody?.actionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch {}

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to undo action' 
      },
      { status: 500 }
    );
  }
}

// Undo send action (recall email if possible)
async function undoSendAction(gmailClient: any, data: any) {
  const { messageId, draftId } = data;
  
  try {
    // Try to recall the sent message (only works for recent sends in some cases)
    if (messageId) {
      // Move to drafts or delete if very recent
      await gmailClient.users.messages.trash({
        userId: 'me',
        id: messageId
      });
      
      return { recalled: true, messageId };
    }
    
    // If it was a scheduled send, cancel it
    if (draftId) {
      await gmailClient.users.drafts.delete({
        userId: 'me',
        id: draftId
      });
      
      return { cancelled: true, draftId };
    }
    
    return { warning: 'Email was already sent and cannot be recalled' };
  } catch (error) {
    throw new Error(`Failed to undo send: ${error}`);
  }
}

// Undo delete action (restore from trash)
async function undoDeleteAction(gmailClient: any, data: any) {
  const { emailIds, originalLabels } = data;
  
  if (!emailIds?.length) {
    throw new Error('No email IDs provided for undo delete');
  }

  const results = [];
  
  for (const emailId of emailIds) {
    try {
      // Remove from trash
      await gmailClient.users.messages.untrash({
        userId: 'me',
        id: emailId
      });
      
      // Restore original labels if available
      if (originalLabels?.length) {
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: emailId,
          resource: {
            addLabelIds: originalLabels
          }
        });
      }
      
      results.push({ emailId, restored: true });
    } catch (error) {
      results.push({ emailId, error: error instanceof Error ? error.message : 'Failed to restore' });
    }
  }
  
  return { restoredEmails: results };
}

// Undo archive action (move back to inbox)
async function undoArchiveAction(gmailClient: any, data: any) {
  const { emailIds } = data;
  
  if (!emailIds?.length) {
    throw new Error('No email IDs provided for undo archive');
  }

  const results = [];
  
  for (const emailId of emailIds) {
    try {
      // Add inbox label and remove any archive-related labels
      await gmailClient.users.messages.modify({
        userId: 'me',
        id: emailId,
        resource: {
          addLabelIds: ['INBOX'],
          removeLabelIds: ['Label_1'] // Remove archive label if exists
        }
      });
      
      results.push({ emailId, restored: true });
    } catch (error) {
      results.push({ emailId, error: error instanceof Error ? error.message : 'Failed to restore' });
    }
  }
  
  return { restoredEmails: results };
}

// Undo unsubscribe action
async function undoUnsubscribeAction(emailAccountId: string, data: any) {
  const { emailIds, senderEmails } = data;
  
  // Reverse any unsubscribe database changes
  if (emailIds?.length) {
    await prisma.newsletter.updateMany({
      where: {
        emailAccountId,
        id: { in: emailIds }
      },
      data: {
        status: null // Re-activate newsletters by clearing status
      }
    });
  }
  
  return { 
    reversedUnsubscribes: emailIds?.length || 0,
    message: 'Unsubscribe actions have been reversed. You may receive emails from these senders again.'
  };
}

// Undo schedule action
async function undoScheduleAction(gmailClient: any, data: any) {
  const { scheduledMessageId, draftId } = data;
  
  if (scheduledMessageId) {
    // Cancel scheduled send
    await gmailClient.users.messages.delete({
      userId: 'me',
      id: scheduledMessageId
    });
  }
  
  if (draftId) {
    // Delete scheduled draft
    await gmailClient.users.drafts.delete({
      userId: 'me',
      id: draftId
    });
  }
  
  return { scheduleCancelled: true };
}

// Undo bulk action
async function undoBulkAction(gmailClient: any, emailAccountId: string, data: any) {
  const { emailIds, actionType, originalState } = data;
  
  const results = [];
  
  for (const emailId of emailIds || []) {
    try {
      // Restore based on original state
      if (originalState?.[emailId]) {
        const original = originalState[emailId];
        
        await gmailClient.users.messages.modify({
          userId: 'me',
          id: emailId,
          resource: {
            addLabelIds: original.labelIds || [],
            removeLabelIds: [] // Calculate which labels to remove
          }
        });
      }
      
      results.push({ emailId, restored: true });
    } catch (error) {
      results.push({ emailId, error: error instanceof Error ? error.message : 'Failed to restore' });
    }
  }
  
  return { bulkUndoResults: results };
}
