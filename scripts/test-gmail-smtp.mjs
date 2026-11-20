import assert from 'node:assert/strict';
import { getGmailConfig } from '../src/lib/email/gmail.ts';
import { EMAIL_TEMPLATE_BY_EVENT, EMAIL_SUBJECT_BY_EVENT } from '../src/lib/email/catalog.ts';

console.log('🧪 Starting VSHMA Gmail SMTP & Template Rendering Test Suite...\n');

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

// 1. Password sanitization and config detection
runTest('Gmail config safely sanitizes surrounding quotes and whitespace from Google App Password', () => {
  const origUser = process.env.GMAIL_USER;
  const origPass = process.env.GMAIL_APP_PASSWORD;

  try {
    process.env.GMAIL_USER = '"mahendrart07@gmail.com"';
    process.env.GMAIL_APP_PASSWORD = '"abcd efgh ijkl mnop" # Google App Password';

    const config = getGmailConfig();
    assert.equal(config.user, 'mahendrart07@gmail.com');
    assert.equal(config.pass, 'abcdefghijklmnop');
    assert.equal(config.isConfigured, true);
  } finally {
    process.env.GMAIL_USER = origUser;
    process.env.GMAIL_APP_PASSWORD = origPass;
  }
});

// 2. All 7 event catalog entries exist
runTest('All 7 appointment notification events have registered templates and subjects', () => {
  const events = Object.keys(EMAIL_TEMPLATE_BY_EVENT);
  assert.equal(events.length, 7, 'Must have exactly 7 notification types');

  for (const event of events) {
    assert.ok(Boolean(EMAIL_TEMPLATE_BY_EVENT[event]), `Must have template alias for ${event}`);
    assert.ok(Boolean(EMAIL_SUBJECT_BY_EVENT[event]), `Must have subject for ${event}`);
  }
});

// 3. Unconfigured fallback returns false
runTest('Unconfigured credentials safely disable Gmail transport without crashing', () => {
  const origUser = process.env.GMAIL_USER;
  const origPass = process.env.GMAIL_APP_PASSWORD;

  try {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;

    const config = getGmailConfig();
    assert.equal(config.isConfigured, false);
  } finally {
    process.env.GMAIL_USER = origUser;
    process.env.GMAIL_APP_PASSWORD = origPass;
  }
});

console.log('\n========================================');
console.log(`Total: ${passedTests}/3 Gmail SMTP Tests Passed.`);
console.log('========================================\n');

