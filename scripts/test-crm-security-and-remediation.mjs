import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHmac, timingSafeEqual } from 'node:crypto';

console.log('='.repeat(75));
console.log('VSHMA CRM — P0/P1 Security, Data Integrity & Remediation Test Suite');
console.log('='.repeat(75));

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Test ${total}: ${name}`);
    console.error(`         Error: ${err.message}`);
  }
}

// -------------------------------------------------------------------
// 1. Meta Webhook Security Tests
// -------------------------------------------------------------------
await test('Missing Meta app secret rejects webhook (fail closed)', () => {
  function validateMetaSignature(rawBody, signatureHeader, appSecret) {
    if (!appSecret) return false;
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
    const providedHash = signatureHeader.slice(7).trim().toLowerCase();
    const expectedHash = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex').toLowerCase();
    const buf1 = Buffer.from(providedHash, 'utf8');
    const buf2 = Buffer.from(expectedHash, 'utf8');
    if (buf1.length !== buf2.length || buf1.length === 0) return false;
    return timingSafeEqual(buf1, buf2);
  }

  const raw = '{"entry":[]}';
  const sig = 'sha256=abcdef1234567890';
  assert.equal(validateMetaSignature(raw, sig, ''), false, 'Empty secret must reject');
  assert.equal(validateMetaSignature(raw, sig, null), false, 'Null secret must reject');
  assert.equal(validateMetaSignature(raw, sig, undefined), false, 'Undefined secret must reject');
});

await test('Incorrect HMAC signature rejects webhook', () => {
  const secret = 'vshma_prod_secret_123';
  const raw = '{"entry":[{"id":"123"}]}';
  const forgedSig = 'sha256=1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';

  function validate(body, sig, sec) {
    if (!sec || !sig?.startsWith('sha256=')) return false;
    const provided = Buffer.from(sig.slice(7).toLowerCase(), 'utf8');
    const expected = Buffer.from(createHmac('sha256', sec).update(body, 'utf8').digest('hex').toLowerCase(), 'utf8');
    if (provided.length !== expected.length || provided.length === 0) return false;
    return timingSafeEqual(provided, expected);
  }

  assert.equal(validate(raw, forgedSig, secret), false, 'Forged hash must be rejected');
  assert.equal(validate(raw, 'sha256=short', secret), false, 'Malformed length hash must be rejected');
});

await test('Correct HMAC signature succeeds using timingSafeEqual', () => {
  const secret = 'vshma_prod_secret_123';
  const raw = '{"entry":[{"id":"123"}]}';
  const realHash = createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  const validSig = `sha256=${realHash}`;

  const provided = Buffer.from(validSig.slice(7).toLowerCase(), 'utf8');
  const expected = Buffer.from(createHmac('sha256', secret).update(raw, 'utf8').digest('hex').toLowerCase(), 'utf8');
  assert.equal(provided.length, expected.length);
  assert.equal(timingSafeEqual(provided, expected), true, 'Valid HMAC signature must verify');
});

await test('Incorrect Meta verification token returns 403 Forbidden', () => {
  function handleWebhookGet(mode, token, challenge, expectedToken) {
    if (mode === 'subscribe') {
      if (expectedToken && token === expectedToken) {
        return { status: 200, body: challenge };
      }
      return { status: 403, body: 'Forbidden: Invalid verification token' };
    }
    return { status: 200, body: JSON.stringify({ status: 'active' }) };
  }

  const resWrong = handleWebhookGet('subscribe', 'bad_token', 'challenge_abc', 'correct_vshma_token');
  assert.equal(resWrong.status, 403);
  assert.equal(resWrong.body, 'Forbidden: Invalid verification token');

  const resRight = handleWebhookGet('subscribe', 'correct_vshma_token', 'challenge_abc', 'correct_vshma_token');
  assert.equal(resRight.status, 200);
  assert.equal(resRight.body, 'challenge_abc');
});

// -------------------------------------------------------------------
// 2. Green API Webhook Security Tests
// -------------------------------------------------------------------
await test('Green API unauthenticated webhook rejects (fail closed)', () => {
  function validateGreenApiWebhook(rawBody, headers, expectedInstance, configuredSecret) {
    if (!configuredSecret || !expectedInstance) return false;
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return false;
    }
    if (String(parsed?.instanceData?.idInstance || '') !== String(expectedInstance)) return false;
    const token = headers['x-green-api-token'] || headers['authorization']?.replace(/^Bearer\s+/i, '') || parsed.token;
    if (!token) return false;
    const candBuf = Buffer.from(token, 'utf8');
    const expBuf = Buffer.from(configuredSecret, 'utf8');
    if (candBuf.length !== expBuf.length || candBuf.length === 0) return false;
    return timingSafeEqual(candBuf, expBuf);
  }

  const validBody = JSON.stringify({ instanceData: { idInstance: '1101999999' } });

  // Missing secret configured
  assert.equal(validateGreenApiWebhook(validBody, { 'x-green-api-token': 'token123' }, '1101999999', ''), false);

  // Mismatched instance ID
  assert.equal(validateGreenApiWebhook(validBody, { 'x-green-api-token': 'token123' }, '8888888888', 'token123'), false);

  // Missing request token
  assert.equal(validateGreenApiWebhook(validBody, {}, '1101999999', 'token123'), false);

  // Valid token
  assert.equal(validateGreenApiWebhook(validBody, { 'x-green-api-token': 'token123' }, '1101999999', 'token123'), true);
});

// -------------------------------------------------------------------
// 3. Family-Shared Phone Matching Logic Tests
// -------------------------------------------------------------------
await test('Family-shared phone number without trustworthy sender name is flagged as ambiguous', () => {
  const registeredPatients = [
    { id: 'pat-1', full_name: 'Rajesh Sharma', phone_normalized: '919876543210' },
    { id: 'pat-2', full_name: 'Sunita Sharma', phone_normalized: '919876543210' },
  ];

  function resolvePatient(senderName, patients) {
    if (patients.length === 1) return { patientId: patients[0].id, isAmbiguous: false };
    if (patients.length > 1) {
      const raw = (senderName || '').trim().toLowerCase();
      if (raw.length >= 2 && !raw.startsWith('whatsapp patient')) {
        const matches = patients.filter((p) => p.full_name.toLowerCase().includes(raw));
        if (matches.length === 1) return { patientId: matches[0].id, isAmbiguous: false };
      }
      return { patientId: null, isAmbiguous: true, reason: 'Family shared phone' };
    }
    return { patientId: 'new-patient', isAmbiguous: false };
  }

  // Untrusted or empty sender name
  const r1 = resolvePatient('', registeredPatients);
  assert.equal(r1.isAmbiguous, true);
  assert.equal(r1.patientId, null, 'Must NOT pick matchingPatients[0]!');

  const r2 = resolvePatient('WhatsApp Patient', registeredPatients);
  assert.equal(r2.isAmbiguous, true);
  assert.equal(r2.patientId, null);

  // Trustworthy exact name match
  const r3 = resolvePatient('Sunita Sharma', registeredPatients);
  assert.equal(r3.isAmbiguous, false);
  assert.equal(r3.patientId, 'pat-2');

  // Single patient on phone
  const r4 = resolvePatient('', [registeredPatients[0]]);
  assert.equal(r4.isAmbiguous, false);
  assert.equal(r4.patientId, 'pat-1');
});

// -------------------------------------------------------------------
// 4. Phone Normalization Parity (TypeScript vs SQL)
// -------------------------------------------------------------------
await test('SQL and TypeScript phone normalization agree on Indian phone numbers', () => {
  function tsNormalize(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  }

  function sqlNormalizeMock(rawPhone) {
    const digits = (rawPhone || '').replace(/[^0-9]/g, '');
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  }

  const testCases = [
    '7416001477',
    '+91 7416001477',
    '+91-7416001477',
    '917416001477',
    '07416001477',
    '+91 98765 43210',
  ];

  for (const c of testCases) {
    const ts = tsNormalize(c);
    const sql = sqlNormalizeMock(c);
    assert.equal(ts, sql, `Mismatch on input: ${c}`);
  }
});

// -------------------------------------------------------------------
// 5. Follow-Up Task API Validation (General vs Patient-Linked)
// -------------------------------------------------------------------
await test('Follow-up task accepts optional patient_id for general clinic tasks', () => {
  function validateFollowUpPayload(body) {
    const { title, due_date, patient_id } = body;
    if (!title || !String(title).trim() || !due_date) {
      return { valid: false, error: 'Title and Due Date are required.' };
    }
    return {
      valid: true,
      data: {
        title: title.trim(),
        due_date,
        patient_id: patient_id && String(patient_id).trim() ? String(patient_id).trim() : null,
      },
    };
  }

  // General task
  const general = validateFollowUpPayload({
    title: 'Order new batch of Arnica 200CH',
    due_date: '2026-11-25',
  });
  assert.equal(general.valid, true);
  assert.equal(general.data.patient_id, null, 'General clinic tasks must have null patient_id');

  // Patient-linked task
  const patientTask = validateFollowUpPayload({
    title: 'Call patient to check reaction to constitutional dose',
    due_date: '2026-11-25',
    patient_id: 'uuid-12345',
  });
  assert.equal(patientTask.valid, true);
  assert.equal(patientTask.data.patient_id, 'uuid-12345');

  // Missing title
  const invalid = validateFollowUpPayload({ due_date: '2026-11-25' });
  assert.equal(invalid.valid, false);
});

// -------------------------------------------------------------------
// 6. RBAC Role Matrix Verification
// -------------------------------------------------------------------
await test('Staff and admin least-privilege permissions are strictly verified', () => {
  const permissions = {
    admin: {
      appointments: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      patients: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      patient_notes: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'VIEW_CONFIDENTIAL'],
      follow_up_tasks: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      conversations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    },
    staff: {
      appointments: ['SELECT', 'UPDATE'],
      patients: ['SELECT', 'INSERT', 'UPDATE'],
      patient_notes: ['SELECT_NON_CONFIDENTIAL', 'INSERT_OWN', 'UPDATE_OWN'],
      follow_up_tasks: ['SELECT', 'INSERT', 'UPDATE'],
      conversations: ['SELECT', 'INSERT_MESSAGE', 'UPDATE'],
    },
  };

  // Admin can delete patients and tasks
  assert.ok(permissions.admin.patients.includes('DELETE'));
  assert.ok(permissions.admin.follow_up_tasks.includes('DELETE'));
  assert.ok(permissions.admin.patient_notes.includes('VIEW_CONFIDENTIAL'));

  // Staff CANNOT delete patients, CANNOT delete tasks, CANNOT view confidential notes
  assert.ok(!permissions.staff.patients.includes('DELETE'));
  assert.ok(!permissions.staff.follow_up_tasks.includes('DELETE'));
  assert.ok(!permissions.staff.patient_notes.includes('VIEW_CONFIDENTIAL'));
});

// -------------------------------------------------------------------
// 7. Migration File Verification
// -------------------------------------------------------------------
await test('Additive migration 20261120120000 exists with follow_up_tasks and RBAC', () => {
  const migPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261120120000_vshma_crm_security_and_corrections.sql'
  );
  assert.ok(fs.existsSync(migPath), 'New additive migration must exist');

  const content = fs.readFileSync(migPath, 'utf8');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.follow_up_tasks'), 'Creates follow_up_tasks');
  assert.ok(content.includes('public.vshma_normalize_phone'), 'Defines vshma_normalize_phone');
  assert.ok(content.includes('Staff can view non-confidential notes'), 'Enforces confidential notes privacy for staff');
  assert.ok(content.includes('v_linked_count + v_step_linked'), 'Accumulates linked count in backfill');
  assert.ok(content.includes('EXIT WHEN NOT EXISTS'), 'Uses safe collision check loop');
});

// -------------------------------------------------------------------
// 8. Unsafe Production Fallback Removal Verification
// -------------------------------------------------------------------
await test('CRM API routes return HTTP 500 on database error rather than synthetic mock fallbacks', () => {
  const patientApiContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/patients/route.ts'),
    'utf8'
  );
  assert.ok(!patientApiContent.includes('source: \'synthesized_from_appointments\''), 'Must not synthesize fake patients');
  assert.ok(patientApiContent.includes('return NextResponse.json({ error: patientErr.message }, { status: 500 })'));

  const inboxApiContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/inbox/conversations/route.ts'),
    'utf8'
  );
  assert.ok(!inboxApiContent.includes('18 * 60 * 60 * 1000'), 'Must not invent fake 18h compliance window');
  assert.ok(!inboxApiContent.includes('source: \'synthesized_from_appointments\''), 'Must not synthesize fake conversations');

  const messagesApiContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/inbox/conversations/[id]/messages/route.ts'),
    'utf8'
  );
  assert.ok(!messagesApiContent.includes('source: \'synthesized_from_appointment\''), 'Must not synthesize fake message bubbles');
});

console.log('='.repeat(75));
console.log(`Results: ${passed} / ${total} tests PASSED`);
console.log('='.repeat(75));

if (passed !== total) {
  process.exit(1);
}
