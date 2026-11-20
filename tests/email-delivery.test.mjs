import assert from 'node:assert/strict';
import test from 'node:test';
import { deliverTransactionalEmail, stableIdempotencyKey } from '../src/lib/email/delivery-core.ts';

const params = {
  to: 'test-recipient@example.test',
  appointmentId: 'appointment-1',
  bookingReference: 'VSHMA-TEST-1',
  notificationType: 'booking_received',
  variables: { PATIENT_NAME: 'Test Patient' },
};

function dependencies(overrides = {}) {
  return {
    reserve: async () => ({ kind: 'reserved', id: 'log-1' }),
    markFailed: async () => true,
    checkPaused: async () => ({ paused: false }),
    getPublishedTemplate: async () => ({ published: true }),
    markAttempt: async () => true,
    send: async () => ({ messageId: 'resend-message-1' }),
    markAccepted: async () => true,
    isConfigured: true,
    from: 'VSHMA <sender@example.test>',
    now: () => new Date('2026-11-20T10:00:00.000Z'),
    ...overrides,
  };
}

test('reserves before send and records the accepted provider message', async () => {
  const calls = [];
  let reservedKey = '';
  let sentKey = '';
  const deps = dependencies({
    reserve: async (_params, _alias, key) => { calls.push('reserve'); reservedKey = key; return { kind: 'reserved', id: 'log-1' }; },
    checkPaused: async () => { calls.push('pause-check'); return { paused: false }; },
    getPublishedTemplate: async () => { calls.push('template-check'); return { published: true }; },
    markAttempt: async () => { calls.push('attempt'); return true; },
    send: async (_params, _from, _alias, key) => { calls.push('send'); sentKey = key; return { messageId: 'resend-message-1' }; },
    markAccepted: async (_id, messageId) => { calls.push(`accepted:${messageId}`); return true; },
  });

  const result = await deliverTransactionalEmail(params, 'vshma-appointment-request', deps);

  assert.deepEqual(calls, ['reserve', 'pause-check', 'template-check', 'attempt', 'send', 'accepted:resend-message-1']);
  assert.equal(reservedKey, stableIdempotencyKey(params.bookingReference, params.notificationType));
  assert.equal(sentKey, reservedKey);
  assert.deepEqual(result, { success: true, messageId: 'resend-message-1' });
});

test('missing notification columns fail reservation and never call Resend', async () => {
  let sendCalls = 0;
  let loggedError = '';
  const deps = dependencies({
    reserve: async () => ({ kind: 'error', error: 'notification_logs schema is missing a required column (42703). Apply migration.' }),
    send: async () => { sendCalls++; return { messageId: 'unexpected' }; },
    onError: (_context, message) => { loggedError = message; },
  });

  const result = await deliverTransactionalEmail(params, 'vshma-appointment-request', deps);

  assert.equal(result.success, false);
  assert.match(result.error || '', /42703/);
  assert.match(loggedError, /42703/);
  assert.equal(sendCalls, 0);
});

test('Resend failures are returned and persisted as failed notifications', async () => {
  const failedMessages = [];
  const deps = dependencies({
    send: async () => ({ error: 'ResendError (HTTP 403)' }),
    markFailed: async (_id, message) => { failedMessages.push(message); return true; },
  });

  const result = await deliverTransactionalEmail(params, 'vshma-appointment-request', deps);

  assert.equal(result.success, false);
  assert.match(result.error || '', /HTTP 403/);
  assert.deepEqual(failedMessages, ['ResendError (HTTP 403)']);
});

test('duplicate idempotency reservation skips sending', async () => {
  let sendCalls = 0;
  let requestedKey = '';
  const deps = dependencies({
    reserve: async (_params, _alias, key) => {
      requestedKey = key;
      return { kind: 'already-sent', id: 'log-existing', messageId: 'resend-existing' };
    },
    send: async () => { sendCalls++; return { messageId: 'unexpected' }; },
  });

  const result = await deliverTransactionalEmail(params, 'vshma-appointment-request', deps);

  assert.equal(requestedKey, stableIdempotencyKey(params.bookingReference, params.notificationType));
  assert.deepEqual(result, { success: true, skipped: true, messageId: 'resend-existing' });
  assert.equal(sendCalls, 0);
});
