import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deliverTransactionalEmail, stableIdempotencyKey } from '../src/lib/email/delivery-core.ts';

console.log('🧪 Starting VSHMA Notification Logs Schema & Sender Verification Suite...\n');

let passedTests = 0;
let totalTests = 5;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ Passed: Test ${passedTests + 1} — ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: Test ${passedTests + 1} — ${name}`);
    console.error(err);
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
  }
}

// 1. Migration File Validation: Verifies all 7 missing columns, constraints, unique index, and RLS
runTest('Additive migration 20261120140000 defines all missing columns and idempotent constraints', () => {
  const sql = readFileSync(resolve('supabase/migrations/20261120140000_vshma_notification_logs_schema_fix.sql'), 'utf-8');

  // Verify all 7 missing columns
  const expectedColumns = [
    'booking_reference',
    'template_alias',
    'resend_message_id',
    'idempotency_key',
    'template_variables',
    'attempted_at',
    'delivered_at',
  ];

  for (const col of expectedColumns) {
    assert.ok(
      sql.includes(col),
      `Migration must add missing column: ${col}`
    );
  }

  // Verify unique idempotency key index
  assert.ok(
    sql.includes('idx_notification_logs_idempotency_key'),
    'Migration must create unique index on idempotency_key'
  );

  // Verify status check constraint covers all statuses
  assert.ok(sql.includes("'accepted'"), 'Status check must include accepted');
  assert.ok(sql.includes("'bounced'"), 'Status check must include bounced');
  assert.ok(sql.includes("'skipped'"), 'Status check must include skipped');
  assert.ok(sql.includes("'processing'"), 'Status check must include processing');

  // Verify channel check constraint
  assert.ok(sql.includes("'whatsapp'"), 'Channel check must include whatsapp');

  // Verify RLS
  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'RLS must be enabled');
});

// 2. Mocked Test: Successful Logging & Reservation
await runAsyncTest('Successful notification reservation, provider dispatch, and accepted status recording', async () => {
  const recordedSteps = [];

  const mockDeps = {
    isConfigured: true,
    from: 'onboarding@resend.dev',
    reserve: async (params, alias, key) => {
      recordedSteps.push({ step: 'reserve', key });
      return { kind: 'reserved', id: 'log-uuid-101' };
    },
    markAttempt: async (id, attemptedAt) => {
      recordedSteps.push({ step: 'markAttempt', id, attemptedAt });
      return true;
    },
    checkPaused: async () => ({ paused: false }),
    getPublishedTemplate: async () => ({ published: true }),
    send: async (params, from, alias, key) => {
      recordedSteps.push({ step: 'send', to: params.to, alias });
      return { messageId: 'resend-msg-999' };
    },
    markAccepted: async (id, messageId, acceptedAt) => {
      recordedSteps.push({ step: 'markAccepted', id, messageId, acceptedAt });
      return true;
    },
    markFailed: async () => true,
  };

  const sampleParams = {
    to: 'mahendrart07@gmail.com',
    appointmentId: 'appt-uuid-001',
    bookingReference: 'VSHMA-202611-1001',
    notificationType: 'admin_new_booking',
    variables: { patientName: 'Test Patient' },
  };

  const result = await deliverTransactionalEmail(sampleParams, 'vshma-admin-new-booking', mockDeps);

  assert.equal(result.success, true);
  assert.equal(result.messageId, 'resend-msg-999');

  // Verify execution order
  assert.equal(recordedSteps[0].step, 'reserve');
  assert.equal(recordedSteps[1].step, 'markAttempt');
  assert.equal(recordedSteps[2].step, 'send');
  assert.equal(recordedSteps[3].step, 'markAccepted');
});

// 3. Mocked Test: Missing Columns (PostgreSQL Error 42703) Surfaces Clearly & Halts Resend Dispatch
await runAsyncTest('PostgreSQL error 42703 on missing columns surfaces clearly without calling Resend', async () => {
  let resendCalled = false;
  const capturedErrors = [];

  const mockDeps = {
    isConfigured: true,
    from: 'onboarding@resend.dev',
    reserve: async () => {
      // Emulate PostgreSQL error 42703 (undefined column) returned by Supabase
      return {
        kind: 'error',
        error: 'Could not reserve email delivery: notification_logs schema is missing a required column (42703): column "booking_reference" of relation "notification_logs" does not exist. Apply the VSHMA notification-log schema migration before retrying. No email was sent.',
      };
    },
    markAttempt: async () => true,
    checkPaused: async () => ({ paused: false }),
    getPublishedTemplate: async () => ({ published: true }),
    send: async () => {
      resendCalled = true;
      return { messageId: 'should-not-be-called' };
    },
    markAccepted: async () => true,
    markFailed: async () => true,
    onError: (context, msg) => {
      capturedErrors.push({ context, msg });
    },
  };

  const sampleParams = {
    to: 'mahendrart07@gmail.com',
    appointmentId: 'appt-uuid-002',
    bookingReference: 'VSHMA-202611-1002',
    notificationType: 'admin_new_booking',
    variables: { patientName: 'Test Patient 2' },
  };

  const result = await deliverTransactionalEmail(sampleParams, 'vshma-admin-new-booking', mockDeps);

  // Must fail cleanly
  assert.equal(result.success, false);
  // Resend provider MUST NOT be invoked
  assert.equal(resendCalled, false, 'Resend send MUST NOT be called when reservation fails');
  // Error message must explicitly identify PostgreSQL error 42703 and missing column
  assert.ok(result.error.includes('42703'), 'Error message must surface PostgreSQL error 42703');
  assert.ok(result.error.includes('missing a required column'), 'Error message must identify missing column');
  assert.ok(result.error.includes('No email was sent'), 'Error message must confirm no email was sent');
});

// 4. Mocked Test: Resend Failure is Accurately Recorded in Database
await runAsyncTest('Resend provider failure accurately updates notification_logs to failed status', async () => {
  let failureRecorded = null;

  const mockDeps = {
    isConfigured: true,
    from: 'onboarding@resend.dev',
    reserve: async () => ({ kind: 'reserved', id: 'log-uuid-failure-test' }),
    markAttempt: async () => true,
    checkPaused: async () => ({ paused: false }),
    getPublishedTemplate: async () => ({ published: true }),
    send: async () => {
      // Emulate Resend API error (e.g. sandbox restriction HTTP 403)
      return {
        error: 'validation_error (HTTP 403): You can only send testing emails to your own email address (mahendrart07@gmail.com).',
      };
    },
    markAccepted: async () => true,
    markFailed: async (id, message) => {
      failureRecorded = { id, message };
      return true;
    },
  };

  const sampleParams = {
    to: 'external.patient@example.com',
    appointmentId: 'appt-uuid-003',
    bookingReference: 'VSHMA-202611-1003',
    notificationType: 'booking_received',
    variables: { patientName: 'External Patient' },
  };

  const result = await deliverTransactionalEmail(sampleParams, 'vshma-patient-booking-ack', mockDeps);

  assert.equal(result.success, false);
  assert.ok(result.error.includes('validation_error (HTTP 403)'));

  // Verify failure was written to database audit log
  assert.ok(failureRecorded !== null, 'markFailed must be invoked upon Resend error');
  assert.equal(failureRecorded.id, 'log-uuid-failure-test');
  assert.ok(failureRecorded.message.includes('HTTP 403'));
});

// 5. Mocked Test: Duplicate Idempotency Key Prevents Duplicate Dispatches
await runAsyncTest('Duplicate idempotency key recognizes existing dispatch and avoids duplicate send', async () => {
  let resendCallCount = 0;

  const mockDeps = {
    isConfigured: true,
    from: 'onboarding@resend.dev',
    reserve: async (params, alias, key) => {
      // Simulate detection of existing sent row with matching idempotency key
      return {
        kind: 'already-sent',
        id: 'existing-log-uuid-555',
        messageId: 'resend-msg-prior-dispatch-111',
      };
    },
    markAttempt: async () => true,
    checkPaused: async () => ({ paused: false }),
    getPublishedTemplate: async () => ({ published: true }),
    send: async () => {
      resendCallCount++;
      return { messageId: 'duplicate-not-allowed' };
    },
    markAccepted: async () => true,
    markFailed: async () => true,
  };

  const sampleParams = {
    to: 'mahendrart07@gmail.com',
    appointmentId: 'appt-uuid-004',
    bookingReference: 'VSHMA-202611-1004',
    notificationType: 'admin_new_booking',
    variables: { patientName: 'Duplicate Test' },
  };

  const result = await deliverTransactionalEmail(sampleParams, 'vshma-admin-new-booking', mockDeps);

  assert.equal(result.success, true);
  assert.equal(result.skipped, true);
  assert.equal(result.messageId, 'resend-msg-prior-dispatch-111');
  assert.equal(resendCallCount, 0, 'Resend MUST NOT be called when idempotency key already exists');
});

console.log(`\n========================================`);
console.log(`Total: ${passedTests}/${totalTests} Tests Passed.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
