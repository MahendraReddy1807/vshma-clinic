import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  generateBookingReference,
  validateIndianMobile,
  generateWhatsAppUrl,
  sanitizeInput,
  getTodayISO,
} from '@/lib/utils';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { buildEmailVariables } from '@/lib/email/template-variables';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      phone,
      email,
      age,
      appointment_date,
      preferred_time,
      consultation_type,
      message,
      privacy_consent,
    } = body;

    // 1. Validation
    if (typeof full_name !== 'string' || !full_name.trim() || full_name.length > 120) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (typeof phone !== 'string' || !validateIndianMobile(phone)) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Optional email validation
    let sanitizedEmail: string | null = null;
    if (email && typeof email === 'string' && email.trim()) {
      const emailTrimmed = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
      }
      sanitizedEmail = emailTrimmed.slice(0, 150);
    }

    // Optional age validation
    let parsedAge: number | null = null;
    if (age !== undefined && age !== null && age !== '') {
      const numAge = parseInt(String(age), 10);
      if (!Number.isNaN(numAge) && numAge >= 0 && numAge <= 120) {
        parsedAge = numAge;
      }
    }

    if (typeof appointment_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
      return NextResponse.json({ error: 'Preferred date is required.' }, { status: 400 });
    }

    // Check date is not in past
    if (appointment_date < getTodayISO()) {
      return NextResponse.json(
        { error: 'Appointment date cannot be in the past.' },
        { status: 400 }
      );
    }

    if (!privacy_consent) {
      return NextResponse.json(
        { error: 'You must consent to privacy terms to book an appointment.' },
        { status: 400 }
      );
    }

    // 2. Sanitization
    const sanitizedName = sanitizeInput(full_name).slice(0, 120);
    const sanitizedPhone = phone.replace(/[\s\-()]/g, '');
    const sanitizedTime =
      typeof preferred_time === 'string' && preferred_time
        ? sanitizeInput(preferred_time).slice(0, 80)
        : null;
    const sanitizedType =
      typeof consultation_type === 'string' && consultation_type.trim()
        ? sanitizeInput(consultation_type).slice(0, 100)
        : 'General Consultation';
    const sanitizedMessage =
      typeof message === 'string' && message ? sanitizeInput(message).slice(0, 500) : null;

    const booking_reference = generateBookingReference();

    // Never return booking success unless Supabase persists the request.
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
    ) {
      return NextResponse.json({ error: 'Booking service is not configured.' }, { status: 503 });
    }

    // 4. Real Supabase Database Insertion
    const supabase = createServerSupabaseClient();
    const { data: insertedAppt, error: dbError } = await supabase
      .from('appointments')
      .insert({
        booking_reference,
        full_name: sanitizedName,
        phone: sanitizedPhone,
        email: sanitizedEmail,
        age: parsedAge,
        appointment_date,
        preferred_time: sanitizedTime,
        consultation_type: sanitizedType,
        message: sanitizedMessage,
        status: 'pending',
      })
      .select('id,created_at')
      .single();

    if (dbError || !insertedAppt) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json(
        { error: 'Unable to reserve appointment right now. Please try via WhatsApp directly.' },
        { status: 500 }
      );
    }

    const appointmentId = insertedAppt.id;

    // 5. In-dashboard notification for Real-Time Administrator Alert
    try {
      await supabase.from('admin_notifications').insert({
        appointment_id: appointmentId,
        title: `New Booking: ${sanitizedName}`,
        message: `${sanitizedType} requested for ${appointment_date} (${sanitizedTime || 'Flexible'})`,
        type: 'new_booking',
        is_read: false,
      });
    } catch (notifErr) {
      console.error('[Admin Notification Insert Error]', notifErr);
    }

    // 6. Check automation settings for email dispatch
    try {
      const { data: settings } = await supabase.from('automation_settings').select('key, value');
      const settingsMap = (settings || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, boolean>);

      const emergencyPause = settingsMap['emergency_email_pause'] === true;

      if (!emergencyPause) {
        // Patient booking acknowledgement email
        if (sanitizedEmail && settingsMap['enable_booking_acknowledgement'] !== false) {
          await sendTransactionalEmail({
            to: sanitizedEmail,
            appointmentId,
            bookingReference: booking_reference,
            notificationType: 'booking_received',
            variables: buildEmailVariables({
              patientName: sanitizedName,
              bookingReference: booking_reference,
              appointmentDate: appointment_date,
              appointmentTime: sanitizedTime,
              bookingCreatedAt: insertedAppt.created_at,
            }),
          }).catch((err) => console.error('[Patient Email Error]', err));
        }

        // Admin notification email
        if (settingsMap['enable_admin_notification'] !== false) {
          await sendTransactionalEmail({
            to: process.env.ADMIN_NOTIFICATION_EMAIL || '',
            appointmentId,
            bookingReference: booking_reference,
            notificationType: 'admin_new_booking',
            variables: buildEmailVariables({
              patientName: sanitizedName,
              patientEmail: sanitizedEmail,
              patientPhone: sanitizedPhone,
              bookingReference: booking_reference,
              appointmentDate: appointment_date,
              appointmentTime: sanitizedTime,
              bookingCreatedAt: insertedAppt.created_at,
            }),
          }).catch((err) => console.error('[Admin Email Error]', err));
        }
      }
    } catch (emailSettingErr) {
      console.error('[Email Automation Trigger Error]', emailSettingErr);
    }

    // 7. Generate dynamic WhatsApp URL
    const whatsapp_url = generateWhatsAppUrl({
      name: sanitizedName,
      phone: sanitizedPhone,
      date: appointment_date,
      time: sanitizedTime || undefined,
      type: sanitizedType,
      reference: booking_reference,
    });

    return NextResponse.json(
      {
        success: true,
        booking_reference,
        appointment_id: appointmentId,
        whatsapp_url,
        message: 'Appointment booking request received successfully.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('API Error /api/appointments:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
