// ============================================================
// VSHMA – Shared TypeScript types
// ============================================================

/* ---------- Appointment / Booking ---------- */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  booking_reference: string;
  full_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  appointment_date: string; // ISO date string YYYY-MM-DD
  preferred_time: string | null;
  rescheduled_date?: string | null;
  rescheduled_time?: string | null;
  consultation_type: string;
  message: string | null;
  status: AppointmentStatus;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  full_name: string;
  phone: string;
  email: string;
  age?: number | string;
  appointment_date: string;
  preferred_time: string;
  consultation_type: string;
  message: string;
  privacy_consent: boolean;
}

/* ---------- Admin ---------- */

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

/* ---------- Dashboard Stats ---------- */

export interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  rescheduled: number;
  completed: number;
  cancelled: number;
}

/* ---------- Notification Logs ---------- */

export type NotificationType =
  | 'booking_received'
  | 'admin_new_booking'
  | 'appointment_confirmed'
  | 'appointment_rescheduled'
  | 'appointment_cancelled'
  | 'reminder_24h'
  | 'reminder_2h';

export interface NotificationLog {
  id: string;
  appointment_id: string;
  notification_type: NotificationType;
  channel: 'email' | 'in_app' | 'whatsapp';
  recipient: string;
  subject: string | null;
  status: 'pending' | 'queued' | 'sent' | 'failed' | 'delivered';
  error_message: string | null;
  booking_reference?: string | null;
  template_alias?: string | null;
  template_variables?: Record<string, string | number> | null;
  idempotency_key?: string | null;
  resend_message_id?: string | null;
  attempted_at?: string | null;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
}

/* ---------- Reminder Jobs ---------- */

export interface ReminderJob {
  id: string;
  appointment_id: string;
  reminder_type: '24h' | '2h';
  scheduled_for: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/* ---------- Clinic Knowledge Base ---------- */

export type KnowledgeCategory =
  | 'doctor_information'
  | 'clinic_information'
  | 'consultation_process'
  | 'appointment_booking'
  | 'clinic_timings'
  | 'contact_information'
  | 'booking_policies'
  | 'treatment_guidance'
  | 'homeopathy_general';

export interface ClinicFaq {
  id: string;
  category: KnowledgeCategory;
  question: string;
  answer: string;
  is_active: boolean;
  is_doctor_approved: boolean;
  last_reviewed_at: string;
  created_at: string;
  updated_at: string;
}

/* ---------- Admin In-Dashboard Real-time Notifications ---------- */

export interface AdminNotification {
  id: string;
  appointment_id: string | null;
  title: string;
  message: string;
  type: 'new_booking' | 'confirmed' | 'rescheduled' | 'cancelled' | 'reminder_failed';
  is_read: boolean;
  created_at: string;
}

/* ---------- Automation Settings ---------- */

export interface AutomationSettings {
  enable_booking_acknowledgement: boolean;
  enable_admin_notification: boolean;
  enable_appointment_confirmation: boolean;
  enable_24h_reminders: boolean;
  enable_2h_reminders: boolean;
  emergency_email_pause: boolean;
}

/* ---------- Consultation types ---------- */

export const CONSULTATION_TYPES = [
  'General Consultation',
  'Follow-up Consultation',
  'Pediatric Homeopathy',
  "Women's Health",
  'Skin & Hair Care',
  'Digestive Health',
  'New Patient Consultation',
  'Online Consultation',
] as const;

/* ---------- Service / Treatment card ---------- */

export interface ServiceCard {
  title: string;
  description: string;
  icon: string;
}

/* ---------- Navigation ---------- */

export interface NavLink {
  label: string;
  href: string;
}
