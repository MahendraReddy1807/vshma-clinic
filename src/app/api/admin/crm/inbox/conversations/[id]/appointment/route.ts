import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateBookingReference } from '@/lib/utils';
import { notifyAdminNewBookingViaWhatsApp } from '@/lib/whatsapp/service';

/**
 * POST /api/admin/crm/inbox/conversations/[id]/appointment
 * Creates a pending appointment directly from an ongoing conversation thread.
 * Follows the standard clinic appointment workflow:
 * - Always starts with status: 'pending' (never auto-confirmed)
 * - Patient receives standard notification if opted in
 * - Clinic reception notification is triggered independently
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const {
      appointment_date,
      preferred_time = '10:30 AM',
      consultation_type = 'General Consultation',
      notes = '',
    } = body;

    if (!appointment_date) {
      return NextResponse.json({ error: 'Appointment date is required' }, { status: 400 });
    }

    // 1. Locate conversation & patient details
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('*, patients(*)')
      .eq('id', id)
      .single();

    if (convErr || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const patient = conv.patients;
    const patientName = patient?.full_name || 'Patient';
    const patientPhone = patient?.phone || conv.external_chat_id;
    const patientEmail = patient?.email || null;
    const whatsappOptIn = Boolean(patient?.whatsapp_opt_in ?? true);
    const bookingRef = generateBookingReference();

    // 2. Create standard appointment record (status: 'pending')
    // Schema note: The core appointments table column is 'message' (not 'notes').
    const formattedMessage = notes ? `[From Inbox Conversation] ${notes.trim()}` : '[Initiated from Inbox Conversation]';

    const basePayload: Record<string, unknown> = {
      booking_reference: bookingRef,
      patient_id: conv.patient_id || null,
      full_name: patientName,
      phone: patientPhone,
      email: patientEmail,
      appointment_date,
      preferred_time,
      consultation_type,
      message: formattedMessage,
      status: 'pending',
    };

    let appointment: { id?: string; [key: string]: unknown } | null = null;
    let apptErr: { message?: string } | null = null;

    // First attempt: insert with full consent audit columns
    const fullPayload = {
      ...basePayload,
      whatsapp_opt_in: whatsappOptIn,
      whatsapp_opt_in_source: 'admin_inbox_conversation',
      whatsapp_opt_in_timestamp: new Date().toISOString(),
    };

    const firstTry = await supabase.from('appointments').insert(fullPayload).select('*').single();

    if (firstTry.error) {
      // If whatsapp_opt_in_source or timestamp column is missing in schema cache
      if (firstTry.error.message?.includes('whatsapp_opt_in_source') || firstTry.error.message?.includes('whatsapp_opt_in_timestamp')) {
        const retryWithOptIn = await supabase.from('appointments').insert({
          ...basePayload,
          whatsapp_opt_in: whatsappOptIn,
        }).select('*').single();

        if (retryWithOptIn.error && retryWithOptIn.error.message?.includes('whatsapp_opt_in')) {
          const minimal = await supabase.from('appointments').insert(basePayload).select('*').single();
          appointment = minimal.data;
          apptErr = minimal.error;
        } else {
          appointment = retryWithOptIn.data;
          apptErr = retryWithOptIn.error;
        }
      } else if (firstTry.error.message?.includes('whatsapp_opt_in')) {
        const minimal = await supabase.from('appointments').insert(basePayload).select('*').single();
        appointment = minimal.data;
        apptErr = minimal.error;
      } else {
        apptErr = firstTry.error;
      }
    } else {
      appointment = firstTry.data;
    }

    if (apptErr || !appointment) {
      return NextResponse.json({ error: apptErr?.message || 'Failed to create appointment record' }, { status: 500 });
    }

    // Also persist staff notes to patient_notes if a patient profile is linked
    if (conv.patient_id && notes.trim()) {
      try {
        await supabase.from('patient_notes').insert({
          patient_id: conv.patient_id,
          note_content: `[Appointment ${bookingRef}] ${notes.trim()}`,
          author_id: auth.user?.id || null,
          is_clinical: false,
        });
      } catch {
        // Non-blocking
      }
    }

    // 3. Update conversation last message / activity
    await supabase.from('conversations').update({
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    // 4. Record patient activity if linked
    if (conv.patient_id) {
      await supabase.from('patient_activity').insert({
        patient_id: conv.patient_id,
        activity_type: 'appointment_created',
        title: `Appointment Request Created (${bookingRef})`,
        details: {
          appointment_date,
          preferred_time,
          consultation_type,
          booking_reference: bookingRef,
        },
        actor: 'staff',
      });
    }

    // 5. Trigger clinic reception alert independently of patient consent
    try {
      await notifyAdminNewBookingViaWhatsApp({
        appointmentId: String(appointment?.id || ''),
        bookingReference: bookingRef,
        patientName,
        patientPhone,
        appointmentDate: appointment_date,
        preferredTime: preferred_time,
        consultationType: consultation_type,
      });
    } catch {
      // Safe fallback: non-blocking
    }

    return NextResponse.json({
      success: true,
      appointment,
      booking_reference: bookingRef,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
