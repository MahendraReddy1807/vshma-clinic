import { NextResponse } from 'next/server';
import { WhatsAppProviderFactory } from '@/lib/crm/whatsapp/factory';
import { WhatsAppCRMService } from '@/lib/crm/whatsapp/crm-service';
import { processWhatsAppWebhookPayload } from '@/lib/whatsapp/service';
import type { WhatsAppWebhookPayload } from '@/lib/whatsapp/types';

/**
 * GET /api/webhooks/whatsapp
 * Meta WhatsApp Cloud API Webhook Verification Handshake & Health Probe
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  // 1. Meta Webhook Subscription Verification Handshake
  if (mode === 'subscribe') {
    if (verifyToken && token === verifyToken) {
      console.log('[WhatsApp Webhook] Handshake verified successfully.');
      return new Response(challenge || '', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('[WhatsApp Webhook] Subscription verification failed: Token mismatch or verify token unconfigured.');
    return new Response('Forbidden: Invalid verification token', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Health probe support (only when not a subscribe request)
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/whatsapp',
    provider: (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase(),
    meta_configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_APP_SECRET),
    green_api_configured: Boolean(
      (process.env.GREEN_API_ID_INSTANCE?.trim() || process.env.GREEN_API_INSTANCE_ID?.trim()) &&
      (process.env.GREEN_API_TOKEN_INSTANCE?.trim() || process.env.GREEN_API_API_TOKEN?.trim())
    ),
  });
}

/**
 * POST /api/webhooks/whatsapp
 * Provider-Independent Webhook Handler
 * Supports Meta Cloud API and Green API
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const provider = WhatsAppProviderFactory.getProvider();

    // 1. Cryptographic Signature & Token Verification
    const isValid = provider.validateWebhook(request, rawBody);
    if (!isValid) {
      console.warn('[WhatsApp Webhook] Invalid webhook signature or token.');
      return new Response('Forbidden: Invalid webhook signature', { status: 403 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    // 2. Check for Inbound Message
    const incomingMsg = provider.normalizeIncomingMessage(payload);
    if (incomingMsg) {
      const result = await WhatsAppCRMService.processInboundMessage(incomingMsg);
      return NextResponse.json({
        success: true,
        type: 'inbound_message',
        conversationId: result.conversationId,
        isDuplicate: result.isDuplicate,
      });
    }

    // 3. Check for Delivery Status Receipt
    const deliveryStatus = provider.normalizeDeliveryStatus(payload);
    if (deliveryStatus) {
      await WhatsAppCRMService.processDeliveryStatus(deliveryStatus);
      return NextResponse.json({
        success: true,
        type: 'delivery_status',
        status: deliveryStatus.status,
      });
    }

    // 4. Backward Compatibility: Meta legacy statuses
    const metaPayload = payload as WhatsAppWebhookPayload;
    if (metaPayload?.object === 'whatsapp_business_account') {
      const { updatedCount } = await processWhatsAppWebhookPayload(metaPayload);
      return NextResponse.json({ success: true, updatedCount });
    }

    return NextResponse.json({ message: 'Webhook event acknowledged without state changes.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[WhatsApp Webhook Handler Error]', msg);
    // Providers expect 200 OK acknowledgment to prevent endless exponential retry loops
    return NextResponse.json({ success: false, error: msg }, { status: 200 });
  }
}
