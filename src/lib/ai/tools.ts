import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CLINIC_INFO, TIME_SLOTS, CONSULTATION_TYPES } from '@/lib/constants';
import { generateBookingReference, generateWhatsAppUrl, validateIndianMobile } from '@/lib/utils';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { buildEmailVariables } from '@/lib/email/template-variables';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const AI_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_clinic_faq',
      description: 'Search doctor-approved clinic knowledge base for answers to patient questions.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keywords or topic' },
          category: {
            type: 'string',
            enum: [
              'doctor_information',
              'clinic_information',
              'consultation_process',
              'appointment_booking',
              'clinic_timings',
              'contact_information',
              'booking_policies',
            ],
            description: 'Optional category filter',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_clinic_information',
      description: 'Retrieve verified clinic details, doctor credentials, location, and philosophy.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_clinic_hours',
      description: 'Retrieve operating days, consultation slots, and scheduling rules.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_appointment_availability',
      description: 'Check available consultation windows for a given date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_appointment_request',
      description:
        'Submit a patient appointment request AFTER the patient has confirmed all their details.',
      parameters: {
        type: 'object',
        properties: {
          full_name: { type: 'string', description: 'Patient full name' },
          phone: { type: 'string', description: '10-digit Indian mobile number' },
          email: { type: 'string', description: 'Optional patient email address' },
          appointment_date: { type: 'string', description: 'Appointment date YYYY-MM-DD' },
          preferred_time: {
            type: 'string',
            description: 'Chosen slot (e.g. Morning (9 AM – 12 PM), Afternoon, Evening)',
          },
          consultation_type: {
            type: 'string',
            description: 'Type of consultation (e.g. General Consultation, Pediatric, etc.)',
          },
          message: { type: 'string', description: 'Optional notes' },
          confirmed_by_patient: {
            type: 'boolean',
            description: 'Must be true to confirm patient agreed to submit this reservation',
          },
        },
        required: ['full_name', 'phone', 'appointment_date', 'confirmed_by_patient'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_booking_status',
      description: 'Check status of an existing appointment using booking reference and verified phone number.',
      parameters: {
        type: 'object',
        properties: {
          booking_reference: { type: 'string', description: 'Booking reference ID (e.g. VSHMA-123456)' },
          phone: { type: 'string', description: 'Registered 10-digit phone number for verification' },
        },
        required: ['booking_reference', 'phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_human_assistance',
      description: 'Offer patient direct contact with the clinic reception and doctor via WhatsApp hotline.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for handoff' },
        },
      },
    },
  },
];

export async function executeAiTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const supabase = createServerSupabaseClient();

  switch (name) {
    case 'get_clinic_information': {
      return {
        clinic_name: CLINIC_INFO.fullName,
        doctor: CLINIC_INFO.doctor,
        qualification: `${CLINIC_INFO.qualificationFull} (${CLINIC_INFO.qualification})`,
        location: CLINIC_INFO.location,
        tagline: CLINIC_INFO.tagline,
        consultation_formats: 'In-Clinic (Bengaluru) & Confidential Virtual Telehealth',
        whatsapp_hotline: `+91 ${CLINIC_INFO.phone}`,
      };
    }

    case 'get_clinic_hours': {
      return {
        operating_days: 'Monday through Saturday',
        closed: 'Sunday',
        time_windows: TIME_SLOTS.map((t) => t.label),
        booking_policy: 'All consultations are conducted strictly by prior appointment.',
      };
    }

    case 'search_clinic_faq': {
      const query = String(args.query || '').trim().toLowerCase();
      try {
        let dbQuery = supabase
          .from('clinic_knowledge_base')
          .select('category, question, answer')
          .eq('is_active', true)
          .eq('is_doctor_approved', true);

        if (args.category) {
          dbQuery = dbQuery.eq('category', String(args.category));
        }

        const { data } = await dbQuery;
        if (data && data.length > 0) {
          // Score matches
          const matches = data.filter(
            (item) =>
              item.question.toLowerCase().includes(query) ||
              item.answer.toLowerCase().includes(query)
          );
          if (matches.length > 0) return matches.slice(0, 3);
          return data.slice(0, 3);
        }
      } catch {
        // Fallback knowledge items
      }

      return [
        {
          question: 'How do consultations work?',
          answer:
            'Consultations at VSHMA are classical, unhurried evaluations lasting 45-60 minutes where Dr. Chihnitha Reddy T assesses your lifestyle, constitutional history, and symptoms.',
        },
        {
          question: 'Where is the clinic?',
          answer: `VSHMA Homeopathy Clinic is situated in ${CLINIC_INFO.location}. In-person and online video appointments are both available.`,
        },
      ];
    }

    case 'check_appointment_availability': {
      const date = String(args.date || '');
      return {
        date,
        status: 'Slots generally available Monday to Saturday',
        available_windows: [
          'Morning (9 AM – 12 PM)',
          'Afternoon (12 PM – 3 PM)',
          'Evening (3 PM – 6 PM)',
        ],
        note: 'Please select a preferred window and we will confirm exact timing.',
      };
    }

    case 'create_appointment_request': {
      if (!args.confirmed_by_patient) {
        return {
          error: 'Please ask the patient to confirm they wish to submit these details before proceeding.',
        };
      }

      const full_name = String(args.full_name || '').trim();
      const phone = String(args.phone || '').replace(/[\s\-()]/g, '');
      const email = args.email ? String(args.email).trim().toLowerCase() : null;
      const appointment_date = String(args.appointment_date || '');
      const preferred_time = args.preferred_time ? String(args.preferred_time) : null;
      const consultation_type = args.consultation_type ? String(args.consultation_type) : 'General Consultation';
      const message = args.message ? String(args.message) : 'Booked via VSHMA Care Assistant';

      if (!full_name || !validateIndianMobile(phone) || !appointment_date) {
        return { error: 'Please provide valid patient name, 10-digit mobile number, and appointment date.' };
      }

      const booking_reference = generateBookingReference();

      try {
        const { data: inserted, error: insertErr } = await supabase
          .from('appointments')
          .insert({
            booking_reference,
            full_name,
            phone,
            email,
            appointment_date,
            preferred_time,
            consultation_type,
            message,
            status: 'pending',
          })
          .select('id,created_at')
          .single();

        if (insertErr) {
          return { error: 'The appointment request could not be saved. Please contact the clinic directly.' };
        }

        // Trigger notifications
        if (inserted?.id) {
          await supabase.from('admin_notifications').insert({
            appointment_id: inserted.id,
            title: `New AI Booking: ${full_name}`,
            message: `${consultation_type} on ${appointment_date}`,
            type: 'new_booking',
          });

          if (email) {
            await sendTransactionalEmail({
              to: email,
              appointmentId: inserted.id,
              bookingReference: booking_reference,
              notificationType: 'booking_received',
              variables: buildEmailVariables({
                patientName: full_name,
                bookingReference: booking_reference,
                appointmentDate: appointment_date,
                appointmentTime: preferred_time,
                bookingCreatedAt: inserted.created_at,
              }),
            });
          }

          await sendTransactionalEmail({
            to: process.env.ADMIN_NOTIFICATION_EMAIL || '',
            appointmentId: inserted.id,
            bookingReference: booking_reference,
            notificationType: 'admin_new_booking',
            variables: buildEmailVariables({
              patientName: full_name,
              patientEmail: email,
              patientPhone: phone,
              bookingReference: booking_reference,
              appointmentDate: appointment_date,
              appointmentTime: preferred_time,
              bookingCreatedAt: inserted.created_at,
            }),
          });
        }

        return {
          success: true,
          booking_reference,
          patient_name: full_name,
          date: appointment_date,
          time: preferred_time,
          message: 'Appointment request has been submitted successfully to the clinic queue.',
          whatsapp_url: generateWhatsAppUrl({
            name: full_name,
            phone,
            date: appointment_date,
            time: preferred_time || undefined,
            type: consultation_type,
            reference: booking_reference,
          }),
        };
      } catch (err) {
        return {
          error: 'The appointment request could not be completed. Please contact the clinic directly.',
        };
      }
    }

    case 'get_booking_status': {
      const ref = String(args.booking_reference || '').trim().toUpperCase();
      const phone = String(args.phone || '').replace(/[\s\-()]/g, '');

      try {
        const { data: appt } = await supabase
          .from('appointments')
          .select('booking_reference, full_name, appointment_date, preferred_time, consultation_type, status')
          .eq('booking_reference', ref)
          .eq('phone', phone)
          .maybeSingle();

        if (!appt) {
          return {
            found: false,
            message:
              'No matching appointment was found with that booking reference and mobile number. Please check the reference code.',
          };
        }

        return {
          found: true,
          booking_reference: appt.booking_reference,
          patient_name: appt.full_name,
          appointment_date: appt.appointment_date,
          preferred_time: appt.preferred_time,
          consultation_type: appt.consultation_type,
          status: appt.status,
        };
      } catch {
        return { found: false, message: 'Could not lookup record right now. Please try again shortly.' };
      }
    }

    case 'request_human_assistance': {
      return {
        whatsapp_url: CLINIC_INFO.whatsappUrl,
        whatsapp_number: `+91 ${CLINIC_INFO.phone}`,
        clinic_email: CLINIC_INFO.email || 'care@vshma.in',
        message: 'You can chat directly with Dr. Chihnitha Reddy T and the clinic team on WhatsApp.',
      };
    }

    default:
      return { error: `Tool ${name} is not recognized.` };
  }
}
