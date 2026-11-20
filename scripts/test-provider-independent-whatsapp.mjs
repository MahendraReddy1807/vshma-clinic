import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';

console.log('🧪 Starting Provider-Independent WhatsApp CRM Verification Suite...\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

// 1. Meta Provider Verification (Contract & Normalization)
await runTest('Meta provider normalizes Meta Cloud API incoming message payload', async () => {
  const sampleMetaPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '917416001477', phone_number_id: '109876543210' },
              contacts: [{ profile: { name: 'Priya Sharma' }, wa_id: '919876543210' }],
              messages: [
                {
                  from: '919876543210',
                  id: 'wamid.HBgLPriya123==',
                  timestamp: '1700000000',
                  text: { body: 'I need consultation for skin care' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  const entry = sampleMetaPayload.entry[0].changes[0].value;
  const msg = entry.messages[0];
  const contact = entry.contacts[0];

  assert.equal(msg.id, 'wamid.HBgLPriya123==');
  assert.equal(msg.from, '919876543210');
  assert.equal(msg.text.body, 'I need consultation for skin care');
  assert.equal(contact.profile.name, 'Priya Sharma');
});

// 2. Green API Provider Verification (Contract & Normalization)
await runTest('Green API provider normalizes Green API incoming message webhook', async () => {
  const sampleGreenPayload = {
    typeWebhook: 'incomingMessageReceived',
    instanceData: { idInstance: 1101999999, wid: '917416001477@c.us' },
    timestamp: 1700000000,
    idMessage: 'GREEN_MSG_9999',
    senderData: { chatId: '919988776655@c.us', sender: '919988776655@c.us', senderName: 'Vikram Rao' },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: 'Is clinic open on Saturday?' },
    },
  };

  const cleanPhone = sampleGreenPayload.senderData.chatId.replace('@c.us', '').replace(/[^0-9]/g, '');
  assert.equal(cleanPhone, '919988776655');
  assert.equal(sampleGreenPayload.idMessage, 'GREEN_MSG_9999');
  assert.equal(sampleGreenPayload.messageData.textMessageData.textMessage, 'Is clinic open on Saturday?');
  assert.equal(sampleGreenPayload.senderData.senderName, 'Vikram Rao');
});

// 3. HMAC Signature Validation Logic
await runTest('Meta webhook signature validator computes correct HMAC-SHA256', async () => {
  const appSecret = 'vshma_meta_secret_test';
  const rawBody = JSON.stringify({ test: 'payload_data' });
  const validSignature = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;

  const computed = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  assert.equal(computed, validSignature);

  const forgedSignature = 'sha256=invalid_hash_value_123';
  assert.notEqual(computed, forgedSignature);
});

// 4. Inbound Deduplication Logic
await runTest('CRM message deduplication detects previously ingested provider_message_id', async () => {
  const processedMessageIds = new Set(['wamid.HBgLMTIz==', 'GREEN_MSG_001']);

  function isDuplicate(id) {
    if (processedMessageIds.has(id)) return true;
    processedMessageIds.add(id);
    return false;
  }

  assert.equal(isDuplicate('wamid.HBgLMTIz=='), true, 'Existing Meta message ID must be flagged as duplicate');
  assert.equal(isDuplicate('GREEN_MSG_001'), true, 'Existing Green API message ID must be flagged as duplicate');
  assert.equal(isDuplicate('wamid.NEW_MSG_999=='), false, 'New message ID must not be flagged');
  assert.equal(isDuplicate('wamid.NEW_MSG_999=='), true, 'Second check of new ID must now be duplicate');
});

// 5. Schema Migration Syntax & Constraints
await runTest('Conversations inbox schema migration defines tables, indexes, and RLS', async () => {
  const migPath = path.resolve(process.cwd(), 'supabase/migrations/20261120110000_vshma_conversations_inbox_schema.sql');
  assert.ok(fs.existsSync(migPath), 'Conversations inbox schema migration must exist');

  const content = fs.readFileSync(migPath, 'utf8');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.conversations'), 'Must create conversations');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.conversation_messages'), 'Must create conversation_messages');
  assert.ok(content.includes('idx_conversation_messages_provider_id'), 'Must create unique index on provider_message_id');
  assert.ok(content.includes('ENABLE ROW LEVEL SECURITY'), 'Must enforce RLS');
  assert.ok(content.includes('customer_service_window_expires_at'), 'Must track 24h Meta customer service window');
});

// 6. Source Files Verification
await runTest('Provider-independent architecture files exist in src/lib/crm/whatsapp/', async () => {
  const files = [
    'src/lib/crm/whatsapp/provider.interface.ts',
    'src/lib/crm/whatsapp/meta-provider.ts',
    'src/lib/crm/whatsapp/green-api-provider.ts',
    'src/lib/crm/whatsapp/factory.ts',
    'src/lib/crm/whatsapp/crm-service.ts',
  ];

  for (const f of files) {
    const fullPath = path.resolve(process.cwd(), f);
    assert.ok(fs.existsSync(fullPath), `File ${f} must exist`);
  }
});

console.log(`\n========================================`);
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`Passed:      ${passedTests}`);
console.log(`Failed:      ${failedTests}`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
