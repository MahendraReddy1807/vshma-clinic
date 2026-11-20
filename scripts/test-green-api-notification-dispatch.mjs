import assert from 'node:assert/strict';
import { GreenApiWhatsAppProvider, setMockGreenTransport } from '../src/lib/crm/whatsapp/green-api-provider.ts';

console.log('🧪 Starting Green API WhatsApp Notification Dispatch Verification Suite...\n');

let passedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ Passed: Test ${passedTests + 1} — ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: Test ${passedTests + 1} — ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ Passed: Test ${passedTests + 1} — ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: Test ${passedTests + 1} — ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Helper to test payload formatting for Green API
function renderWhatsAppTextFromPayload(payload) {
  const templateName = payload.template?.name || '';
  const params = [];

  for (const comp of payload.template?.components || []) {
    if (comp.parameters) {
      for (const p of comp.parameters) {
        if (p.type === 'text' && p.text) {
          params.push(p.text);
        }
      }
    }
  }

  if (templateName === 'vshma_patient_appointment_confirmed') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Confirmed* ✅',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      'Your consultation with *Dr. Chihnitha Reddy T (BHMS)* is officially CONFIRMED!',
      '',
      '📋 *Confirmed Schedule:*',
      `• *Confirmed Date:* ${params[1] || 'Scheduled'}`,
      `• *Exact Time (IST):* ${params[2] || 'Scheduled Window'}`,
      `• *Consultation:* ${params[3] || 'Homeopathic Consultation'}`,
      `• *Booking Reference:* ${params[4] || 'VSHMA-REF'}`,
      '• *Location:* Bengaluru, Karnataka, India',
    ].join('\n');
  }

  return templateName;
}

// 1. Green API Configuration Detection
runTest('Green API configuration detection succeeds without Meta credentials', () => {
  const orig = { ...process.env };
  try {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;

    process.env.WHATSAPP_PROVIDER = 'green_api';
    process.env.GREEN_API_ID_INSTANCE = '710722808462';
    process.env.GREEN_API_TOKEN_INSTANCE = 'mock_green_token_123';

    const provider = new GreenApiWhatsAppProvider();
    assert.equal(provider.getIdInstance(), '710722808462');
    assert.equal(provider.getApiToken(), 'mock_green_token_123');
    assert.equal(provider.getHost(), 'https://7107.api.greenapi.com');
  } finally {
    process.env = orig;
  }
});

// 2. renderWhatsAppTextFromPayload converts Meta template payload into readable text
runTest('Template components render rich, formatted WhatsApp message for Green API', () => {
  const payload = {
    messaging_product: 'whatsapp',
    to: '918142672300',
    template: {
      name: 'vshma_patient_appointment_confirmed',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'Mahendra Reddy' },
            { type: 'text', text: '23 November 2026' },
            { type: 'text', text: '10:30 AM' },
            { type: 'text', text: 'General Consultation' },
            { type: 'text', text: 'VSHMA-CXCXPC' },
          ],
        },
      ],
    },
  };

  const text = renderWhatsAppTextFromPayload(payload);
  assert.ok(text.includes('Appointment Confirmed'), 'Must include title');
  assert.ok(text.includes('Mahendra Reddy'), 'Must include patient name');
  assert.ok(text.includes('23 November 2026'), 'Must include date');
  assert.ok(text.includes('10:30 AM'), 'Must include exact time');
  assert.ok(text.includes('VSHMA-CXCXPC'), 'Must include reference');
  assert.ok(text.includes('Dr. Chihnitha Reddy T'), 'Must include doctor name');
});

// 3. Green API dispatch executes successfully without Meta credentials
await runAsyncTest('Green API provider dispatches messages with zero Meta credentials required', async () => {
  const orig = { ...process.env };
  try {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;

    process.env.WHATSAPP_PROVIDER = 'green_api';
    process.env.GREEN_API_ID_INSTANCE = '710722808462';
    process.env.GREEN_API_TOKEN_INSTANCE = 'mock_token_abc';
    process.env.GREEN_API_URL = 'https://7107.api.greenapi.com';

    let capturedUrl = '';
    let capturedBody = null;

    setMockGreenTransport(async (url, options) => {
      capturedUrl = url;
      capturedBody = JSON.parse(String(options.body));
      return new Response(JSON.stringify({ idMessage: 'GREEN_MSG_SUCCESS_999' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const provider = new GreenApiWhatsAppProvider();
    const result = await provider.sendTextMessage({
      recipientPhone: '918142672300',
      messageText: 'Your appointment is confirmed!',
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 'sent');
    assert.equal(result.providerMessageId, 'GREEN_MSG_SUCCESS_999');
    assert.ok(capturedUrl.includes('https://7107.api.greenapi.com/waInstance710722808462/sendMessage/'));
    assert.equal(capturedBody.chatId, '918142672300@c.us');
    assert.equal(capturedBody.message, 'Your appointment is confirmed!');
  } finally {
    setMockGreenTransport(null);
    process.env = orig;
  }
});

console.log('\n========================================');
console.log(`Total: ${passedTests}/3 Tests Passed.`);
console.log('========================================\n');
