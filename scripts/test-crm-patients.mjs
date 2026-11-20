import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Starting VSHMA CRM Phase 1 Verification Suite...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

// 1. Phone Normalization Logic
function normalizePhoneDigits(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

runTest('Phone Normalization standardizes 10-digit Indian numbers to E.164 (without plus)', () => {
  assert.equal(normalizePhoneDigits('9876543210'), '919876543210');
  assert.equal(normalizePhoneDigits('+91 98765 43210'), '919876543210');
  assert.equal(normalizePhoneDigits('+91-7416001477'), '917416001477');
  assert.equal(normalizePhoneDigits('07416001477'), '07416001477');
});

// 2. Family Shared Phone Resolution Logic
runTest('Family phone sharing identifies distinct patients on identical phone numbers', () => {
  const sampleAppointments = [
    { id: '1', full_name: 'Rajesh Kumar', phone: '+91 9876543210', created_at: '2026-01-10T10:00:00Z', whatsapp_opt_in: true },
    { id: '2', full_name: 'Sunita Kumar', phone: '9876543210', created_at: '2026-02-15T10:00:00Z', whatsapp_opt_in: false },
    { id: '3', full_name: 'Rajesh Kumar', phone: '98765 43210', created_at: '2026-03-20T10:00:00Z', whatsapp_opt_in: true },
    { id: '4', full_name: 'Amit Patel', phone: '9123456789', created_at: '2026-02-01T10:00:00Z', whatsapp_opt_in: true },
  ];

  const phoneToNamesMap = new Map();
  for (const a of sampleAppointments) {
    const norm = normalizePhoneDigits(a.phone);
    if (!phoneToNamesMap.has(norm)) phoneToNamesMap.set(norm, new Set());
    phoneToNamesMap.get(norm).add(a.full_name.trim().toLowerCase());
  }

  // Check phone 919876543210
  const sharedPhoneNames = phoneToNamesMap.get('919876543210');
  assert.equal(sharedPhoneNames.size, 2, 'Should detect 2 distinct individuals sharing 9876543210');
  assert.ok(sharedPhoneNames.has('rajesh kumar'));
  assert.ok(sharedPhoneNames.has('sunita kumar'));

  // Synthesize patient records
  const patientMap = new Map();
  for (const a of sampleAppointments) {
    const norm = normalizePhoneDigits(a.phone);
    const name = a.full_name.trim();
    const isShared = phoneToNamesMap.get(norm).size > 1;
    const key = `${norm}__${name.toLowerCase()}`;

    if (!patientMap.has(key)) {
      patientMap.set(key, {
        full_name: name,
        phone_normalized: norm,
        total_appointments: 1,
        whatsapp_opt_in: Boolean(a.whatsapp_opt_in),
        is_flagged_ambiguous: isShared,
      });
    } else {
      const p = patientMap.get(key);
      p.total_appointments++;
      if (a.whatsapp_opt_in) p.whatsapp_opt_in = true;
    }
  }

  const synthesized = Array.from(patientMap.values());
  assert.equal(synthesized.length, 3, 'Should create 3 patient records (Rajesh, Sunita, Amit), not 2');

  const rajesh = synthesized.find((p) => p.full_name === 'Rajesh Kumar');
  assert.ok(rajesh);
  assert.equal(rajesh.total_appointments, 2, 'Rajesh should have 2 visits aggregated');
  assert.equal(rajesh.is_flagged_ambiguous, true, 'Rajesh should be flagged for shared family phone');
  assert.equal(rajesh.whatsapp_opt_in, true);

  const sunita = synthesized.find((p) => p.full_name === 'Sunita Kumar');
  assert.ok(sunita);
  assert.equal(sunita.total_appointments, 1);
  assert.equal(sunita.is_flagged_ambiguous, true, 'Sunita should be flagged for shared family phone');

  const amit = synthesized.find((p) => p.full_name === 'Amit Patel');
  assert.ok(amit);
  assert.equal(amit.total_appointments, 1);
  assert.equal(amit.is_flagged_ambiguous, false, 'Amit does not share phone');
});

// 3. Local Migration Verification
runTest('Local migration file exists and has correct Phase 1 schema', () => {
  const migPath = path.resolve(process.cwd(), 'supabase/migrations/20261120100000_vshma_crm_patients_schema.sql');
  assert.ok(fs.existsSync(migPath), 'Migration file must exist');

  const content = fs.readFileSync(migPath, 'utf8');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.patients'), 'Must define public.patients');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.patient_activity'), 'Must define public.patient_activity');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.patient_notes'), 'Must define public.patient_notes');
  assert.ok(content.includes('ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY'), 'Must enable RLS on patients');
  assert.ok(content.includes('backfill_appointments_to_patients'), 'Must include safe idempotent backfill procedure');
  assert.ok(!content.includes('phone TEXT UNIQUE'), 'Must NOT enforce phone TEXT UNIQUE (allows family sharing)');
});

// 4. CRM Navigation Verification
runTest('Admin layout defines all 8 CRM modules', () => {
  const layoutPath = path.resolve(process.cwd(), 'src/app/admin/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  const expectedNavHrefs = [
    '/admin/dashboard',
    '/admin/inbox',
    '/admin/appointments',
    '/admin/patients',
    '/admin/follow-ups',
    '/admin/notifications',
    '/admin/analytics',
    '/admin/settings',
  ];

  for (const href of expectedNavHrefs) {
    assert.ok(layoutContent.includes(href), `Admin layout must contain navigation link to ${href}`);
  }
});

// 5. CRM Route Protection Verification
runTest('CRM API routes verify admin authentication server-side', () => {
  const patientsRoute = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/patients/route.ts'),
    'utf8'
  );
  assert.ok(patientsRoute.includes('verifyAdminAuth'), 'Patients list API must call verifyAdminAuth');

  const patientDetailsRoute = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/patients/[id]/route.ts'),
    'utf8'
  );
  assert.ok(patientDetailsRoute.includes('verifyAdminAuth'), 'Patient details API must call verifyAdminAuth');

  const patientNotesRoute = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/api/admin/crm/patients/[id]/notes/route.ts'),
    'utf8'
  );
  assert.ok(patientNotesRoute.includes('verifyAdminAuth'), 'Patient notes API must call verifyAdminAuth');
});

console.log(`\n========================================`);
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`Passed:      ${passedTests}`);
console.log(`Failed:      ${failedTests}`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
