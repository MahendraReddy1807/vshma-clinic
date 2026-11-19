import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  generateBookingReference,
  validateIndianMobile,
  generateWhatsAppUrl,
  sanitizeInput,
  getTodayISO,
} from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      phone,
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

    if (typeof appointment_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
      return NextResponse.json({ error: 'Preferred date is required.' }, { status: 400 });
    }

    // Check date is not in past
    const selectedDate = new Date(`${appointment_date}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate.toISOString().slice(0, 10) !== appointment_date) {
      return NextResponse.json({ error: 'Please provide a valid appointment date.' }, { status: 400 });
    }
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
    const sanitizedTime = typeof preferred_time === 'string' && preferred_time ? sanitizeInput(preferred_time).slice(0, 80) : null;
    const allowedTypes = ['General Consultation', 'Follow-up Consultation', 'New Patient Consultation', 'Online Consultation'];
    const sanitizedType = typeof consultation_type === 'string' && allowedTypes.includes(consultation_type)
      ? consultation_type
      : 'General Consultation';
    const sanitizedMessage = typeof message === 'string' && message ? sanitizeInput(message).slice(0, 500) : null;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      // Staging / Demo fallback: generate valid reference and prefilled WhatsApp URL so patient flow works seamlessly
      const booking_reference = generateBookingReference();
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
          whatsapp_url,
          message: 'Appointment booking request received successfully.',
        },
        { status: 201 }
      );
    }

    // 3. Generate Reference
    const booking_reference = generateBookingReference();

    // Persist the request before returning a booking reference or WhatsApp URL.
    let dbRecordCreated = false;

    try {
      const supabase = createServerSupabaseClient();
      const { error: dbError } = await supabase.from('appointments').insert({
        booking_reference,
        full_name: sanitizedName,
        phone: sanitizedPhone,
        appointment_date,
        preferred_time: sanitizedTime,
        consultation_type: sanitizedType,
        message: sanitizedMessage,
        status: 'pending',
      });

      if (dbError) {
        console.error('Supabase insert error:', dbError);
      } else {
        dbRecordCreated = true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to communicate with Supabase:', message);
    }

    if (!dbRecordCreated) {
      return NextResponse.json(
        { error: 'Unable to reserve appointment right now. Please try via WhatsApp directly.' },
        { status: 500 }
      );
    }

    // 5. Generate dynamic WhatsApp URL
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
