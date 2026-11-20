-- ============================================================
-- VSHMA HOMEOPATHY CLINIC — MASTER PRODUCTION DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- Project Ref: uzhofqzyrjuysajycbhs
-- ============================================================
-- This master script creates the complete, robust schema for VSHMA Clinic:
-- 1. appointments (core patient consultation bookings)
-- 2. admin_profiles (authorized clinic staff and doctors)
-- 3. notification_logs (transactional email and alert audit trail)
-- 4. reminder_jobs (automated 24h & 2h appointment reminder queue)
-- 5. clinic_knowledge_base (doctor-approved clinical FAQ & AI grounding)
-- 6. admin_notifications (real-time in-dashboard alert notices)
-- 7. automation_settings (feature flags and emergency email pause)
-- Includes: RLS Policies, Indexes, Triggers, Realtime CDC, and Seeds.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. APPOINTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INT,
  appointment_date DATE NOT NULL,
  preferred_time TEXT,
  rescheduled_date DATE,
  rescheduled_time TEXT,
  consultation_type TEXT NOT NULL DEFAULT 'General Consultation',
  message TEXT,
  cancellation_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Idempotent column check: Ensure columns exist if table was created in an earlier migration
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS rescheduled_date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS rescheduled_time TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Ensure status constraint permits 'rescheduled'
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
  CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_ref ON public.appointments(booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON public.appointments(email);

-- ============================================================
-- 2. ADMIN PROFILES TABLE (Linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'doctor', 'staff')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_role_check;
ALTER TABLE public.admin_profiles ADD CONSTRAINT admin_profiles_role_check 
  CHECK (role IN ('admin', 'doctor', 'staff'));

-- ============================================================
-- 3. NOTIFICATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'booking_received', 'admin_new_booking', 'appointment_confirmed', 'appointment_rescheduled', 'appointment_cancelled', 'reminder_24h', 'reminder_2h'
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'in_app', 'whatsapp')),
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  retry_count INT DEFAULT 0 NOT NULL,
  booking_reference TEXT,
  template_alias TEXT,
  resend_message_id TEXT,
  idempotency_key TEXT,
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_appointment ON public.notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_logs_idempotency_key
  ON public.notification_logs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ============================================================
-- 4. AUTOMATED REMINDER JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminder_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_jobs_status_sched ON public.reminder_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminder_jobs_appointment ON public.reminder_jobs(appointment_id);

-- ============================================================
-- 5. CLINIC KNOWLEDGE BASE TABLE (Doctor-Approved FAQs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clinic_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'doctor_information',
    'clinic_information',
    'consultation_process',
    'appointment_booking',
    'clinic_timings',
    'contact_information',
    'booking_policies',
    'treatment_guidance',
    'homeopathy_general'
  )),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_doctor_approved BOOLEAN DEFAULT true NOT NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.clinic_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON public.clinic_knowledge_base(is_active, is_doctor_approved);

-- ============================================================
-- 6. REAL-TIME ADMIN NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'new_booking' NOT NULL 
    CHECK (type IN ('new_booking', 'confirmed', 'rescheduled', 'cancelled', 'reminder_failed')),
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_appointment ON public.admin_notifications(appointment_id);

-- ============================================================
-- 7. AUTOMATION SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.automation_settings (
  key TEXT PRIMARY KEY,
  value BOOLEAN DEFAULT true NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 8. DATABASE TRIGGERS & TIMESTAMP FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_appointment_updated ON public.appointments;
CREATE TRIGGER on_appointment_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_reminder_job_updated ON public.reminder_jobs;
CREATE TRIGGER on_reminder_job_updated
  BEFORE UPDATE ON public.reminder_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_knowledge_base_updated ON public.clinic_knowledge_base;
CREATE TRIGGER on_knowledge_base_updated
  BEFORE UPDATE ON public.clinic_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_automation_settings_updated ON public.automation_settings;
CREATE TRIGGER on_automation_settings_updated
  BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy policies
DROP POLICY IF EXISTS "Public can submit appointment bookings" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authorized administrators can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Administrators can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Administrators can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Administrators can delete appointments" ON public.appointments;

-- Appointments: Admins can view, update, delete
CREATE POLICY "Admins can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- Admin Profiles: Users can view their own profile
DROP POLICY IF EXISTS "Admins can view own admin profile" ON public.admin_profiles;
CREATE POLICY "Admins can view own admin profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Notification Logs: Admin access only
DROP POLICY IF EXISTS "Admins can view notification logs" ON public.notification_logs;
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- Reminder Jobs: Admin access only
DROP POLICY IF EXISTS "Admins can view reminder jobs" ON public.reminder_jobs;
CREATE POLICY "Admins can view reminder jobs"
  ON public.reminder_jobs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- Knowledge Base: Public can read active doctor-approved; Admins have full CRUD
DROP POLICY IF EXISTS "Public can read approved knowledge base" ON public.clinic_knowledge_base;
CREATE POLICY "Public can read approved knowledge base"
  ON public.clinic_knowledge_base FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_doctor_approved = true);

DROP POLICY IF EXISTS "Admins can manage knowledge base" ON public.clinic_knowledge_base;
CREATE POLICY "Admins can manage knowledge base"
  ON public.clinic_knowledge_base FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- Admin Notifications: Admins have full access
DROP POLICY IF EXISTS "Admins can view and update admin notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view and update admin notifications"
  ON public.admin_notifications FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- Automation Settings: Admins have full access
DROP POLICY IF EXISTS "Admins can view and update automation settings" ON public.automation_settings;
CREATE POLICY "Admins can view and update automation settings"
  ON public.automation_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- ============================================================
-- 10. ROLE PERMISSIONS & GRANTS
-- ============================================================
GRANT SELECT ON public.clinic_knowledge_base TO anon, authenticated;
GRANT ALL ON public.clinic_knowledge_base TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_notifications TO authenticated;
GRANT ALL ON public.notification_logs TO authenticated;
GRANT ALL ON public.reminder_jobs TO authenticated;
GRANT ALL ON public.automation_settings TO authenticated;

-- Service role bypasses RLS and maintains full access by default.

-- ============================================================
-- 11. SUPABASE REALTIME CDC PUBLICATION
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- 12. INITIAL PRODUCTION SEED DATA
-- ============================================================

-- Automation Default Switches
INSERT INTO public.automation_settings (key, value, description)
VALUES
  ('enable_booking_acknowledgement', true, 'Send booking request acknowledgement email to patient'),
  ('enable_admin_notification', true, 'Send new booking alert email to clinic administrator'),
  ('enable_appointment_confirmation', true, 'Send confirmation email when appointment is approved by doctor/admin'),
  ('enable_24h_reminders', true, 'Schedule and dispatch 24-hour appointment reminders'),
  ('enable_2h_reminders', true, 'Schedule and dispatch 2-hour appointment reminders'),
  ('emergency_email_pause', false, 'Master kill-switch to immediately pause all transactional email sending')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;

-- Doctor-Approved Clinic Knowledge Base
INSERT INTO public.clinic_knowledge_base (category, question, answer, is_active, is_doctor_approved)
VALUES
  (
    'doctor_information',
    'Who is the lead doctor at VSHMA Clinic?',
    'Dr. Chihnitha Reddy T (BHMS) is the lead homeopathic practitioner at VSHMA Homeopathy Clinic in Bengaluru. She specializes in classical, individualized evaluations for chronic and recurring health concerns.',
    true,
    true
  ),
  (
    'clinic_information',
    'Where is VSHMA Homeopathy Clinic located?',
    'VSHMA Homeopathy Clinic is located in Bengaluru, Karnataka, India. We offer both in-person clinical consultations in Bengaluru and secure virtual video consultations for remote patients across India.',
    true,
    true
  ),
  (
    'clinic_timings',
    'What are the clinic operating hours?',
    'VSHMA is open Monday through Saturday for scheduled appointments across Morning (9 AM to 12 PM), Afternoon (12 PM to 3 PM), and Evening (3 PM to 6 PM) windows. Sunday is closed.',
    true,
    true
  ),
  (
    'consultation_process',
    'What happens during an initial homeopathic consultation?',
    'An initial consultation takes approximately 45 to 60 minutes. Dr. Chihnitha evaluates your complete physical symptoms, constitutional vitality, mental stress, sleep cycles, and medical history before determining your individualized remedy.',
    true,
    true
  ),
  (
    'appointment_booking',
    'How do I book an appointment?',
    'You can request a consultation by filling out the online booking form on our website or directly messaging our WhatsApp clinic hotline at +91 7416001477. Once submitted, your slot will be reviewed and confirmed.',
    true,
    true
  ),
  (
    'booking_policies',
    'Is my appointment immediately confirmed upon website submission?',
    'Submitting the website form records your preferred slot request. Our clinic desk confirms availability and issues your official confirmation notice via WhatsApp and email.',
    true,
    true
  ),
  (
    'booking_policies',
    'Can I reschedule or cancel my appointment?',
    'Yes. Appointments can be rescheduled or cancelled by contacting the clinic via WhatsApp (+91 7416001477) or email at least 4 hours in advance.',
    true,
    true
  ),
  (
    'homeopathy_general',
    'Are homeopathic remedies safe alongside conventional medicines?',
    'Yes. Classical homeopathic micro-dilutions do not interfere with standard pharmaceutical medications. Patients are advised never to abruptly stop existing prescribed medications without consulting their attending physician.',
    true,
    true
  ),
  (
    'treatment_guidance',
    'What conditions are commonly addressed at VSHMA Clinic?',
    'We frequently address chronic skin concerns (eczema, psoriasis, allergies), hair thinning, digestive disorders (IBS, acid reflux), pediatric recurrent infections, women''s hormonal rhythms (PCOS, menstrual irregularities), and stress-related ailments.',
    true,
    true
  )
ON CONFLICT DO NOTHING;
