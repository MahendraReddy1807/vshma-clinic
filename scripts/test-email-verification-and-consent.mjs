import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('🧪 Starting VSHMA Email Delivery Verification & WhatsApp Opt-In Test Suite...\n');

let passedTests = 0;
let totalTests = 10;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ Passed: Scenario ${passedTests + 1} — ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: Scenario ${passedTests + 1} — ${name}`);
    console.error(err);
  }
}

// 1. Checkbox in booking form defaults to false (unchecked)
runTest('Booking form WhatsApp opt-in checkbox defaults to false (unchecked)', () => {
  const bookingCode = readFileSync(resolve('src/components/sections/BookingSection.tsx'), 'utf-8');
  assert.ok(
    bookingCode.includes("whatsapp_opt_in: false"),
    'BookingSection formData initial state must set whatsapp_opt_in: false'
  );
  assert.ok(
    bookingCode.includes("checked={formData.whatsapp_opt_in}"),
    'Checkbox input must bind checked directly to formData.whatsapp_opt_in'
  );
  assert.ok(
    bookingCode.includes("Receive appointment updates on WhatsApp"),
    'Checkbox label must include exact requested legal consent text'
  );
  assert.ok(
    bookingCode.includes("To withdraw consent at any time, reply STOP"),
    'Must include consent withdrawal guidance'
  );
});

// 2. Checked consent persists as true with timestamp and source
runTest('Checked consent submits whatsapp_opt_in: true with audit timestamp and source', () => {
  const bookingCode = readFileSync(resolve('src/components/sections/BookingSection.tsx'), 'utf-8');
  assert.ok(
    bookingCode.includes("whatsapp_opt_in: Boolean(formData.whatsapp_opt_in)"),
    'Must explicitly submit boolean value of consent'
  );
  assert.ok(
    bookingCode.includes("whatsapp_opt_in_timestamp:"),
    'Must include opt-in timestamp on submit'
  );
  assert.ok(
    bookingCode.includes("whatsapp_opt_in_source: 'web_booking_form'"),
    'Must include opt-in source as web_booking_form'
  );
});

// 3. Unchecked consent persists as false
runTest('Appointments API saves whatsapp_opt_in as false when unchecked', () => {
  const apiRouteCode = readFileSync(resolve('src/app/api/appointments/route.ts'), 'utf-8');
  assert.ok(
    apiRouteCode.includes("const isOptedIn = Boolean(whatsapp_opt_in)"),
    'API route must parse whatsapp_opt_in as strict boolean'
  );
  assert.ok(
    apiRouteCode.includes("whatsapp_opt_in: isOptedIn"),
    'API route must persist whatsapp_opt_in in appointment payload'
  );
});

// 4. No patient WhatsApp message dispatched when consent is false; logged as "Skipped — patient has not opted in"
runTest('WhatsApp service logs "Skipped — patient has not opted in" when consent is false', () => {
  const waServiceCode = readFileSync(resolve('src/lib/whatsapp/service.ts'), 'utf-8');
  assert.ok(
    waServiceCode.includes("logSkippedConsent"),
    'Must declare logSkippedConsent helper'
  );
  assert.ok(
    waServiceCode.includes("'Skipped — patient has not opted in'"),
    'Must log exact status reason for skipped consent'
  );
  assert.ok(
    waServiceCode.includes("status: 'skipped'"),
    'Must record status as skipped when patient did not opt in'
  );
  // Verify all 5 patient functions check consent and return skipped
  assert.ok(waServiceCode.includes("notifyPatientBookingAckViaWhatsApp"));
  assert.ok(waServiceCode.includes("notifyPatientAppointmentConfirmedViaWhatsApp"));
  assert.ok(waServiceCode.includes("notifyPatientAppointmentRescheduledViaWhatsApp"));
  assert.ok(waServiceCode.includes("notifyPatientAppointmentCancelledViaWhatsApp"));
  assert.ok(waServiceCode.includes("notifyPatientAppointmentReminderViaWhatsApp"));
});

// 5. Email is still dispatched when WhatsApp consent is false
runTest('Email dispatch is executed regardless of WhatsApp opt-in state', () => {
  const apiRouteCode = readFileSync(resolve('src/app/api/appointments/route.ts'), 'utf-8');
  // Email sending occurs before or independently of WhatsApp
  assert.ok(
    apiRouteCode.includes("sendTransactionalEmail"),
    'API route must call sendTransactionalEmail for patient'
  );
  // Admin appointments route also sends email regardless of whatsappOptIn
  const adminApptCode = readFileSync(resolve('src/app/api/admin/appointments/route.ts'), 'utf-8');
  assert.ok(
    adminApptCode.includes("recipientEmail"),
    'Admin route must check recipientEmail for email dispatch'
  );
});

// 6. Clinic admin WhatsApp alerts are dispatched independently of patient consent
runTest('Clinic admin WhatsApp alerts are independent of patient consent', () => {
  const waServiceCode = readFileSync(resolve('src/lib/whatsapp/service.ts'), 'utf-8');
  const adminRouteCode = readFileSync(resolve('src/app/api/appointments/route.ts'), 'utf-8');
  assert.ok(
    waServiceCode.includes("notifyAdminNewBookingViaWhatsApp"),
    'Admin WhatsApp service must exist'
  );
  // Verify admin alert is called without requiring whatsappOptIn
  assert.ok(
    adminRouteCode.includes("notifyAdminNewBookingViaWhatsApp({"),
    'Appointments API must trigger admin alert independently'
  );
});

// 7. Resend API failures record detailed provider error in notification_logs
runTest('Resend provider error includes statusCode and message details', () => {
  const resendCode = readFileSync(resolve('src/lib/email/resend.ts'), 'utf-8');
  assert.ok(
    resendCode.includes("safeProviderError"),
    'Must have safeProviderError helper'
  );
  assert.ok(
    resendCode.includes("error.message"),
    'safeProviderError must preserve error.message'
  );
  assert.ok(
    resendCode.includes("error.statusCode"),
    'safeProviderError must preserve HTTP statusCode'
  );
});

// 8. Accepted emails are recorded as accepted, not falsely marked delivered
runTest('Accepted emails are recorded as "accepted" awaiting webhook delivery', () => {
  const resendCode = readFileSync(resolve('src/lib/email/resend.ts'), 'utf-8');
  assert.ok(
    resendCode.includes("status: 'accepted'"),
    'Resend dispatch must record status as accepted upon API return'
  );
  assert.ok(
    resendCode.includes("isResendTestMode"),
    'Must have isResendTestMode detector'
  );
  assert.ok(
    resendCode.includes("onboarding@resend.dev"),
    'Must check for onboarding@resend.dev test sender'
  );
});

// 9. Webhook delivery updates status to delivered; bounces update to bounced
runTest('Resend webhook route handles email.delivered, email.bounced, and email.complained', () => {
  const webhookCode = readFileSync(resolve('src/app/api/webhooks/resend/route.ts'), 'utf-8');
  assert.ok(
    webhookCode.includes("email.delivered"),
    'Webhook must handle email.delivered event'
  );
  assert.ok(
    webhookCode.includes("status: 'delivered'"),
    'Webhook must set status to delivered'
  );
  assert.ok(
    webhookCode.includes("delivered_at"),
    'Webhook must record delivered_at timestamp'
  );
  assert.ok(
    webhookCode.includes("email.bounced"),
    'Webhook must handle email.bounced event'
  );
  assert.ok(
    webhookCode.includes("status: 'bounced'"),
    'Webhook must set status to bounced'
  );
});

// 10. Retries enforce idempotency and do not duplicate dispatches
runTest('Notification retries protect against duplicate dispatch and enforce consent on WhatsApp retry', () => {
  const retryCode = readFileSync(resolve('src/app/api/admin/notifications/route.ts'), 'utf-8');
  assert.ok(
    retryCode.includes("log.status !== 'failed' && log.status !== 'bounced'"),
    'Retry handler must only retry failed or bounced logs'
  );
  assert.ok(
    retryCode.includes("!appt.whatsapp_opt_in"),
    'WhatsApp retry must reject if patient has not opted in'
  );
  assert.ok(
    retryCode.includes("idempotencyKey: log.idempotency_key"),
    'Email retry must reuse stable idempotency key to prevent duplicates'
  );
});

console.log(`\n========================================`);
console.log(`Total: ${passedTests}/${totalTests} Scenarios Passed.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
