import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { WhatsAppCRMService } from '@/lib/crm/whatsapp/crm-service';

export interface ConversationMessageItem {
  id: string;
  conversation_id: string;
  patient_id: string;
  channel: 'whatsapp' | 'email';
  direction: 'inbound' | 'outbound';
  sender_type: 'patient' | 'staff' | 'system';
  message_body: string;
  message_type: 'text' | 'template' | 'quick_reply';
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string | null;
  created_at: string;
}

/**
 * GET /api/admin/crm/inbox/conversations/[id]/messages
 * Get message history for a conversation thread.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required.' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Query conversation_messages table
    const { data: msgRows, error: msgErr } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgErr) {
      console.error('[Inbox Messages DB Error]', msgErr);
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    if (msgRows && msgRows.length > 0) {
      // Mark unread as 0 on conversation
      await supabase.from('conversations').update({ unread_count: 0 }).eq('id', id);
    }

    return NextResponse.json({
      success: true,
      messages: msgRows || [],
      source: 'database_table',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/crm/inbox/conversations/[id]/messages
 * Staff sends an outbound reply message.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { message_text, recipient_phone, patient_id, retry_message_id } = body;

    if (!message_text || !String(message_text).trim()) {
      return NextResponse.json({ error: 'Message text cannot be empty.' }, { status: 400 });
    }
    if (!recipient_phone) {
      return NextResponse.json({ error: 'Recipient phone number is required.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. If retrying an existing failed message, update in place to avoid duplicates
    if (retry_message_id) {
      const provider = (await import('@/lib/crm/whatsapp/factory')).WhatsAppProviderFactory.getProvider();
      await supabase
        .from('conversation_messages')
        .update({ status: 'queued', error_message: null })
        .eq('id', retry_message_id);

      const sendResult = await provider.sendTextMessage({
        recipientPhone: recipient_phone,
        messageText: String(message_text).trim(),
      });

      if (sendResult.success) {
        await supabase
          .from('conversation_messages')
          .update({
            status: 'sent',
            provider_message_id: sendResult.providerMessageId || null,
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('id', retry_message_id);

        return NextResponse.json({
          success: true,
          providerType: sendResult.providerType,
          messageId: sendResult.providerMessageId,
          status: 'sent',
        });
      } else {
        await supabase
          .from('conversation_messages')
          .update({
            status: 'failed',
            error_message: sendResult.error || 'Retry dispatch failed',
          })
          .eq('id', retry_message_id);

        return NextResponse.json({
          success: false,
          error: sendResult.error,
          status: 'failed',
        }, { status: 502 });
      }
    }

    // 2. Normal staff reply dispatch
    const sendResult = await WhatsAppCRMService.sendStaffReply({
      conversationId: id,
      patientId: patient_id || id,
      recipientPhone: recipient_phone,
      messageText: String(message_text).trim(),
      staffEmail: auth.user?.email || 'staff@vshma.in',
      staffUserId: auth.user?.id,
    });

    return NextResponse.json({
      success: sendResult.success,
      providerType: sendResult.providerType,
      messageId: sendResult.providerMessageId,
      status: sendResult.status,
      error: sendResult.error,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
