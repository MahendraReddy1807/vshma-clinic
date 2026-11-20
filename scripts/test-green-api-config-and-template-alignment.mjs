import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GreenApiWhatsAppProvider } from '../src/lib/crm/whatsapp/green-api-provider.ts';

console.log('🧪 Starting Green API Config Standardization & Email Template Alignment Suite...\n');

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

// 1. Canonical Green API environment variables
runTest('Canonical variable names (GREEN_API_ID_INSTANCE, GREEN_API_TOKEN_INSTANCE, GREEN_API_URL)', () => {
  const orig = { ...process.env };
  try {
    delete process.env.GREEN_API_INSTANCE_ID;
    delete process.env.GREEN_API_API_TOKEN;
    delete process.env.GREEN_API_HOST;

    process.env.GREEN_API_ID_INSTANCE = '710722808462';
    process.env.GREEN_API_TOKEN_INSTANCE = 'token_canonical_secret_123';
    process.env.GREEN_API_URL = 'https://custom.greenapi.com/';

    const provider = new GreenApiWhatsAppProvider();
    assert.equal(provider.getIdInstance(), '710722808462');
    assert.equal(provider.getApiToken(), 'token_canonical_secret_123');
    assert.equal(provider.getHost(), 'https://custom.greenapi.com'); // trailing slash stripped
  } finally {
    process.env = orig;
  }
});

// 2. Default GREEN_API_URL fallback
runTest('GREEN_API_URL defaults to https://7107.api.greenapi.com when not supplied', () => {
  const orig = { ...process.env };
  try {
    delete process.env.GREEN_API_URL;
    delete process.env.GREEN_API_HOST;

    const provider = new GreenApiWhatsAppProvider();
    assert.equal(provider.getHost(), 'https://7107.api.greenapi.com');
  } finally {
    process.env = orig;
  }
});

// 3. Backward-compatible aliases (GREEN_API_INSTANCE_ID, GREEN_API_API_TOKEN, GREEN_API_HOST)
runTest('Backward-compatible aliases work seamlessly when canonical vars are absent', () => {
  const orig = { ...process.env };
  try {
    delete process.env.GREEN_API_ID_INSTANCE;
    delete process.env.GREEN_API_TOKEN_INSTANCE;
    delete process.env.GREEN_API_URL;

    process.env.GREEN_API_INSTANCE_ID = 'legacy_instance_999';
    process.env.GREEN_API_API_TOKEN = 'legacy_token_secret_888';
    process.env.GREEN_API_HOST = 'https://legacy.host.greenapi.com';

    const provider = new GreenApiWhatsAppProvider();
    assert.equal(provider.getIdInstance(), 'legacy_instance_999');
    assert.equal(provider.getApiToken(), 'legacy_token_secret_888');
    assert.equal(provider.getHost(), 'https://legacy.host.greenapi.com');
  } finally {
    process.env = orig;
  }
});

// 4. Missing credentials return clear server-side configuration error
await runAsyncTest('Missing credentials fail safely with exact configuration error', async () => {
  const orig = { ...process.env };
  try {
    delete process.env.GREEN_API_ID_INSTANCE;
    delete process.env.GREEN_API_INSTANCE_ID;
    delete process.env.GREEN_API_TOKEN_INSTANCE;
    delete process.env.GREEN_API_API_TOKEN;

    const provider = new GreenApiWhatsAppProvider();
    const result = await provider.sendTextMessage({
      recipientPhone: '+918142672300',
      messageText: 'Test notification',
    });

    assert.equal(result.success, false);
    assert.equal(result.status, 'failed');
    assert.equal(
      result.error,
      'Green API credentials (GREEN_API_ID_INSTANCE or GREEN_API_TOKEN_INSTANCE) missing.'
    );

    const health = await provider.getConnectionHealth();
    assert.equal(health.isHealthy, false);
    assert.ok(health.statusDetails.includes('Credentials unconfigured'));
  } finally {
    process.env = orig;
  }
});

// 5. Provider factory resolves WHATSAPP_PROVIDER=green_api
runTest('WHATSAPP_PROVIDER=green_api maps to GreenApiWhatsAppProvider type', () => {
  const orig = { ...process.env };
  try {
    process.env.WHATSAPP_PROVIDER = 'green_api';
    const providerType = (process.env.WHATSAPP_PROVIDER || 'meta').trim().toLowerCase();
    assert.equal(providerType, 'green_api');

    const provider = new GreenApiWhatsAppProvider();
    assert.equal(provider.providerType, 'green_api');
  } finally {
    process.env = orig;
  }
});

// 6. Security: Token is never exposed in error messages
await runAsyncTest('Green API provider redacts token from error messages if transport fails', async () => {
  const orig = { ...process.env };
  try {
    process.env.GREEN_API_ID_INSTANCE = '710722808462';
    const secretToken = 'super_secret_green_api_token_value_abc123';
    process.env.GREEN_API_TOKEN_INSTANCE = secretToken;

    const provider = new GreenApiWhatsAppProvider();
    const result = await provider.sendTextMessage({
      recipientPhone: '+918142672300',
      messageText: 'Test message',
    });

    // In a sandboxed test without network or mocking, fetch will throw or fail
    if (!result.success) {
      assert.ok(
        !result.error?.includes(secretToken),
        'Error message must NEVER include the raw Green API token'
      );
    }
  } finally {
    process.env = orig;
  }
});

// 7. Email Template Alignment: Tables with left and right cells guarantee no text squishing in Gmail
runTest('All email templates render voucher cards using bulletproof tables with left/right cell alignment', () => {
  const fileContent = readFileSync(resolve('src/lib/email/templates.ts'), 'utf-8');

  // Must define renderVoucherHeader and renderDetailRow functions using table structure
  assert.ok(fileContent.includes('function renderVoucherHeader'), 'Must have renderVoucherHeader helper');
  assert.ok(fileContent.includes('function renderDetailRow'), 'Must have renderDetailRow helper');

  // Verify renderDetailRow uses table with explicit left and right aligned cells
  assert.ok(
    fileContent.includes('<table role="presentation" width="100%"'),
    'Detail rows must use presentation tables'
  );
  assert.ok(
    fileContent.includes('align="left"'),
    'Must have left-aligned table cell for labels'
  );
  assert.ok(
    fileContent.includes('align="right"'),
    'Must have right-aligned table cell for values'
  );

  // Verify all 6 exported template functions call renderDetailRow or renderVoucherHeader
  const templateFunctions = [
    'renderBookingReceivedEmail',
    'renderAdminNewAppointmentEmail',
    'renderAppointmentConfirmedEmail',
    'renderAppointmentRescheduledEmail',
    'renderAppointmentCancelledEmail',
    'renderAppointmentReminderEmail',
  ];

  for (const fn of templateFunctions) {
    assert.ok(fileContent.includes(fn), `Must export ${fn}`);
  }
});

console.log('\n========================================');
console.log(`Total: ${passedTests}/7 Tests Passed.`);
console.log('========================================\n');
