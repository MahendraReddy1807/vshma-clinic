import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maskEmail,
  maskPhone,
  isCurrentlyQuietHours,
  getNextQuietHoursReleaseTime,
  NOTIFICATION_CONFIG,
} from '../src/lib/notifications/config.ts';
import {
  buildDedupeKey,
} from '../src/lib/notifications/types.ts';
import {
  createMagicToken,
  verifyMagicToken,
} from '../src/lib/notifications/magic-links.ts';
import {
  generateIcsContent,
  generateGoogleCalendarUrl,
} from '../src/lib/notifications/calendar.ts';
import {
  WHATSAPP_TEMPLATES,
} from '../src/lib/notifications/whatsapp-templates.ts';
import {
  SMS_TEMPLATES,
} from '../src/lib/notifications/sms-templates.ts';

test('1. Deduplication Key Integrity', () => {
  const key1 = buildDedupeKey('appt-123', 'booking_received', 'email', 'patient');
  const key2 = buildDedupeKey('appt-123', 'booking_received', 'email', 'patient');
  const key3 = buildDedupeKey('appt-123', 'booking_received', 'whatsapp', 'patient');

  assert.equal(key1, 'appt-123:booking_received:email:patient');
  assert.equal(key1, key2, 'Duplicate key must be identical to guarantee database uniqueness');
  assert.notEqual(key1, key3, 'Different channels must produce different dedupe keys');
});

test('2. Privacy Masking Utilities', () => {
  assert.equal(maskEmail('mahendrart07@gmail.com'), 'm***7@gmail.com');
  assert.equal(maskEmail('patient.care@example.org'), 'p***e@example.org');

  const maskedPhone = maskPhone('917416001477');
  assert.match(maskedPhone, /1477$/);
  assert.ok(!maskedPhone.includes('741600'), 'Full phone digits must never be visible');
});

test('3. Quiet Hours Detection & Rescheduling Math', () => {
  // Test 11:00 PM IST (Quiet hours active)
  const lateNight = new Date('2026-11-28T23:00:00+05:30');
  assert.equal(isCurrentlyQuietHours(lateNight), true);

  // Test 2:00 PM IST (Daytime active)
  const afternoon = new Date('2026-11-28T14:00:00+05:30');
  assert.equal(isCurrentlyQuietHours(afternoon), false);

  // Release time calculation
  const release = getNextQuietHoursReleaseTime(lateNight);
  const istHour = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(release);

  assert.equal(istHour, '07:05', 'Quiet hours release must be 7:05 AM IST');
});

test('4. Secure Magic Links (HMAC Signing & Expiry)', () => {
  const token = createMagicToken('appt-uuid-999', 'confirm', 24);
  assert.ok(token.includes('.'), 'Token must contain payload and signature');

  const verified = verifyMagicToken(token);
  assert.equal(verified.valid, true);
  assert.equal(verified.appointmentId, 'appt-uuid-999');
  assert.equal(verified.action, 'confirm');

  // Test tampered token
  const tampered = token.slice(0, -4) + 'abcd';
  const badVerified = verifyMagicToken(tampered);
  assert.equal(badVerified.valid, false, 'Tampered token must be rejected');

  // Test expired token (-1 hour)
  const expiredToken = createMagicToken('appt-uuid-999', 'cancel', -1);
  const expiredVerified = verifyMagicToken(expiredToken);
  assert.equal(expiredVerified.valid, false);
  assert.match(expiredVerified.error || '', /expired/i);
});

test('5. Calendar Generation (.ics & Google Calendar)', () => {
  const calProps = {
    title: 'Consultation with Dr. Chihnitha Reddy T',
    description: 'Homeopathy clinical intake',
    location: 'VSHMA Homeopathy Clinic, Bengaluru',
    startDate: '2026-11-28',
    timeStr: '10:30 AM',
    durationMinutes: 45,
    referenceNumber: 'VSHMA-CAL-1',
  };

  const ics = generateIcsContent(calProps);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('UID:vshma-VSHMA-CAL-1@vshma.in'));
  assert.ok(ics.includes('END:VCALENDAR'));

  const gcalUrl = generateGoogleCalendarUrl(calProps);
  assert.ok(gcalUrl.startsWith('https://calendar.google.com/calendar/render?'));
  assert.ok(gcalUrl.includes('ctz=Asia%2FKolkata'));
});

test('6. WhatsApp & SMS Template Formatting', () => {
  const sample = {
    patientName: 'Kavitha Rao',
    doctorName: 'Dr. Chihnitha Reddy T',
    referenceNumber: 'VSHMA-9921',
    appointmentDate: 'Sat, 28 Nov 2026',
    appointmentTime: '10:30 AM IST',
    consultationType: 'Constitutional Consultation',
  };

  const waMsg = WHATSAPP_TEMPLATES.confirmed(sample);
  assert.ok(waMsg.includes('Kavitha Rao'));
  assert.ok(waMsg.includes('VSHMA-9921'));
  assert.ok(waMsg.includes('Dr. Chihnitha Reddy T'));

  const smsMsg = SMS_TEMPLATES.confirmed({
    patientName: 'Kavitha Rao',
    timeStr: 'Sat 10:30 AM',
    referenceNumber: 'VSHMA-9921',
  });
  assert.ok(smsMsg.length <= 160, `SMS must be under 160 chars, got ${smsMsg.length}`);
});
