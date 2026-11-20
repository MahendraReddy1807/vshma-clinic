-- ============================================================
-- VSHMA CLINIC DATABASE MIGRATION - 004
-- Modules: Email Automation, Reminder Scheduler, Knowledge Base,
-- Real-time Admin Notifications & Automation Settings
-- ============================================================

-- 1. Extend Appointments Table
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS age INT,
  ADD COLUMN IF NOT EXISTS rescheduled_date DATE,
  ADD COLUMN IF NOT EXISTS rescheduled_time TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Update status constraint to include 'rescheduled'
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
  CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_appointments_email ON public.appointments(email);

-- 2. Notification Delivery Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'booking_received', 'admin_new_booking', 'appointment_confirmed', 'appointment_rescheduled', 'appointment_cancelled', 'reminder_24h', 'reminder_2h'
  channel TEXT NOT NULL DEFAULT 'email',
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_appointment ON public.notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(notification_type);

-- 3. Automated Reminder Jobs Table
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

-- 4. Clinic Knowledge Base (Admin Managed + AI Grounding)
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

-- 5. Real-Time Admin In-Dashboard Notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'new_booking' NOT NULL, -- 'new_booking', 'confirmed', 'rescheduled', 'cancelled', 'reminder_failed'
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_appointment ON public.admin_notifications(appointment_id);

-- 6. Automation & Operational Settings Table
CREATE TABLE IF NOT EXISTS public.automation_settings (
  key TEXT PRIMARY KEY,
  value BOOLEAN DEFAULT true NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Default Settings
INSERT INTO public.automation_settings (key, value, description)
VALUES
  ('enable_booking_acknowledgement', true, 'Send booking request acknowledgement email to patient'),
  ('enable_admin_notification', true, 'Send new booking alert email to clinic administrator'),
  ('enable_appointment_confirmation', true, 'Send confirmation email when appointment is approved by doctor/admin'),
  ('enable_24h_reminders', true, 'Schedule and dispatch 24-hour appointment reminders'),
  ('enable_2h_reminders', true, 'Schedule and dispatch 2-hour appointment reminders'),
  ('emergency_email_pause', false, 'Master kill-switch to immediately pause all transactional email sending')
ON CONFLICT (key) DO NOTHING;

-- Seed Initial Doctor-Approved Knowledge Base
INSERT INTO public.clinic_knowledge_base (category, question, answer, is_active, is_doctor_approved)
VALUES
  (
    'doctor_information',
    'Who is the lead doctor at VSHMA Clinic?',
    'Dr. Chihnitha Reddy T (BHMS) is the lead Homeopathy Practitioner at VSHMA Homeopathy Clinic in Bengaluru. She specializes in classical, unhurried constitutional evaluations for chronic and acute health concerns.',
    true,
    true
  ),
  (
    'clinic_timings',
    'What are the clinic timings for consultations?',
    'VSHMA is open Monday through Saturday for scheduled consultations. Consultations are conducted during Morning (9 AM to 12 PM), Afternoon (12 PM to 3 PM), and Evening (3 PM to 6 PM) windows by prior appointment only. Sunday is closed.',
    true,
    true
  ),
  (
    'clinic_information',
    'Where is VSHMA Clinic located?',
    'VSHMA Homeopathy Clinic is located in Bengaluru, Karnataka, India. We offer both in-person clinical consultations and secure virtual video consultations for remote patients.',
    true,
    true
  ),
  (
    'consultation_process',
    'What happens during an initial consultation?',
    'An initial general consultation lasts 45 to 60 minutes. Dr. Chihnitha evaluates your complete health profile, lifestyle rhythms, mental stress, sleep, and physical history before formulating an individualized constitutional remedy.',
    true,
    true
  ),
  (
    'appointment_booking',
    'How can I book an appointment?',
    'You can book an appointment by filling out the online booking form on our website or directly messaging our WhatsApp clinic hotline at +91 7416001477. Once submitted, your slot will be reviewed and confirmed.',
    true,
    true
  ),
  (
    'booking_policies',
    'Can I reschedule or cancel my appointment?',
    'Yes. Appointments can be rescheduled or cancelled by contacting the clinic via WhatsApp or email at least 4 hours in advance so the slot can be offered to another patient.',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- 7. Enable RLS on New Tables
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- 8. Policies for Notification Logs (Optimized using cached (SELECT auth.uid()))
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- 9. Policies for Reminder Jobs
CREATE POLICY "Admins can view reminder jobs"
  ON public.reminder_jobs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'doctor', 'staff')
  ));

-- 10. Policies for Knowledge Base
-- Public can read active doctor-approved FAQs
CREATE POLICY "Public can read approved knowledge base"
  ON public.clinic_knowledge_base FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_doctor_approved = true);

-- Admins have full access to knowledge base
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

-- 11. Policies for Admin Notifications
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

-- 12. Policies for Automation Settings
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

-- 13. Enable Realtime Change Data Capture (CDC) for Admin Notifications & Appointments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if already added to publication
END $$;

-- 14. Explicit Role Grants
GRANT SELECT ON public.clinic_knowledge_base TO anon, authenticated;
GRANT ALL ON public.clinic_knowledge_base TO authenticated;
GRANT ALL ON public.admin_notifications TO authenticated;
GRANT ALL ON public.notification_logs TO authenticated;
GRANT ALL ON public.reminder_jobs TO authenticated;
GRANT ALL ON public.automation_settings TO authenticated;
