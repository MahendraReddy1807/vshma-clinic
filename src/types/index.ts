// ============================================================
// VSHMA – Shared TypeScript types
// ============================================================

/* ---------- Appointment / Booking ---------- */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  booking_reference: string;
  full_name: string;
  phone: string;
  appointment_date: string;        // ISO date string  YYYY-MM-DD
  preferred_time: string | null;
  consultation_type: string;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  full_name: string;
  phone: string;
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
  completed: number;
  cancelled: number;
}

/* ---------- Consultation types (editable) ---------- */

export const CONSULTATION_TYPES = [
  'General Consultation',
  'Follow-up Consultation',
  'New Patient Consultation',
  'Online Consultation',
] as const;

/* ---------- Service / Treatment card ---------- */

export interface ServiceCard {
  title: string;
  description: string;
  icon: string;          // Lucide icon name
}

/* ---------- Navigation ---------- */

export interface NavLink {
  label: string;
  href: string;
}
