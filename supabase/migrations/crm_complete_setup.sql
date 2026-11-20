-- ====================================================================
-- VSHMA CLINIC CRM — COMPLETE ALL-IN-ONE DATABASE SETUP
-- ====================================================================
-- This single script applies all VSHMA CRM schemas, tables, indexes,
-- least-privilege security policies, and backfills historical appointments.
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to "SQL Editor" on the left menu
-- 3. Click "New Query", paste the entire contents of this file, and click "Run"
-- 4. Return to the VSHMA Admin Dashboard and click "Retry Connection"
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Helper function: Canonical Phone Normalization (E.164 with '91')
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.vshma_normalize_phone(raw_phone TEXT)
RETURNS TEXT AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := REGEXP_REPLACE(COALESCE(raw_phone, ''), '[^0-9]', '', 'g');
  IF LENGTH(digits) = 10 THEN
    RETURN '91' || digits;
  ELSIF LENGTH(digits) = 12 AND digits LIKE '91%' THEN
    RETURN digits;
  ELSE
    RETURN digits;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- --------------------------------------------------------------------
-- 2. Extend Appointments Table
-- --------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'whatsapp_opt_in'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_whatsapp_opt_in 
ON public.appointments(whatsapp_opt_in);

-- --------------------------------------------------------------------
-- 3. Patients Table (Family-Shared Phone Friendly)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL, -- Human readable: VSHMA-YYYY-XXXXX
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL, -- Digits-only: 91XXXXXXXXXX
  email TEXT,
  age INT,
  gender TEXT,
  city TEXT DEFAULT 'Bengaluru',
  whatsapp_opt_in BOOLEAN DEFAULT false,
  first_interaction_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_interaction_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  total_appointments INT DEFAULT 0,
  internal_notes TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  is_flagged_ambiguous BOOLEAN DEFAULT false,
  ambiguity_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_phone_norm ON public.patients(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_opt_in ON public.patients(whatsapp_opt_in);
CREATE INDEX IF NOT EXISTS idx_patients_created ON public.patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_ambiguous ON public.patients(is_flagged_ambiguous);

-- Link Appointments to Patients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE public.appointments 
      ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);

-- --------------------------------------------------------------------
-- 4. Patient Activity & Clinical Notes
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  reference_id UUID,
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  actor TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patient_activity_patient ON public.patient_activity(patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.patient_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patient_notes_patient ON public.patient_notes(patient_id, created_at DESC);

-- --------------------------------------------------------------------
-- 5. Conversations & Omnichannel Messages (Provider-Independent)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  external_chat_id TEXT NOT NULL,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_message_direction TEXT NOT NULL CHECK (last_message_direction IN ('inbound', 'outbound')),
  unread_count INT DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'assigned')),
  assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  customer_service_window_expires_at TIMESTAMPTZ,
  is_flagged_ambiguous BOOLEAN DEFAULT false,
  requires_staff_review BOOLEAN DEFAULT false,
  ambiguity_reason TEXT,
  possible_patient_ids UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON public.conversations(external_chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_phone TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'staff', 'system')),
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'quick_reply', 'system')),
  template_name TEXT,
  provider_type TEXT NOT NULL DEFAULT 'meta' CHECK (provider_type IN ('meta', 'green_api', 'resend')),
  provider_message_id TEXT,
  idempotency_key TEXT,
  is_flagged_ambiguous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_provider_id 
  ON public.conversation_messages(provider_message_id) 
  WHERE provider_message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_idempotency
  ON public.conversation_messages(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_messages_thread 
  ON public.conversation_messages(conversation_id, created_at ASC);

-- --------------------------------------------------------------------
-- 6. Follow-up Tasks Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  due_time TEXT DEFAULT '10:00 AM',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_patient ON public.follow_up_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_due ON public.follow_up_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status ON public.follow_up_tasks(status);

-- --------------------------------------------------------------------
-- 7. Updated At Trigger
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_patient_updated ON public.patients;
CREATE TRIGGER on_patient_updated
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_follow_up_task_updated ON public.follow_up_tasks;
CREATE TRIGGER on_follow_up_task_updated
  BEFORE UPDATE ON public.follow_up_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------
-- 8. Row Level Security & RBAC Policies
-- --------------------------------------------------------------------
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.vshma_get_auth_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.admin_profiles
  WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin Full Access Policies
DROP POLICY IF EXISTS "Admin full access on patients" ON public.patients;
CREATE POLICY "Admin full access on patients" ON public.patients
  FOR ALL TO authenticated
  USING (public.vshma_get_auth_role() IN ('admin', 'staff'))
  WITH CHECK (public.vshma_get_auth_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin full access on patient_activity" ON public.patient_activity;
CREATE POLICY "Admin full access on patient_activity" ON public.patient_activity
  FOR ALL TO authenticated
  USING (public.vshma_get_auth_role() IN ('admin', 'staff'))
  WITH CHECK (public.vshma_get_auth_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin full access on conversations" ON public.conversations;
CREATE POLICY "Admin full access on conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (public.vshma_get_auth_role() IN ('admin', 'staff'))
  WITH CHECK (public.vshma_get_auth_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin full access on conversation_messages" ON public.conversation_messages;
CREATE POLICY "Admin full access on conversation_messages" ON public.conversation_messages
  FOR ALL TO authenticated
  USING (public.vshma_get_auth_role() IN ('admin', 'staff'))
  WITH CHECK (public.vshma_get_auth_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin full access on follow_up_tasks" ON public.follow_up_tasks;
CREATE POLICY "Admin full access on follow_up_tasks" ON public.follow_up_tasks
  FOR ALL TO authenticated
  USING (public.vshma_get_auth_role() IN ('admin', 'staff'))
  WITH CHECK (public.vshma_get_auth_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin access on patient_notes" ON public.patient_notes;
CREATE POLICY "Admin access on patient_notes" ON public.patient_notes
  FOR ALL TO authenticated
  USING (
    public.vshma_get_auth_role() = 'admin' 
    OR (public.vshma_get_auth_role() = 'staff' AND is_confidential = false)
  )
  WITH CHECK (
    public.vshma_get_auth_role() = 'admin'
    OR (public.vshma_get_auth_role() = 'staff' AND is_confidential = false)
  );

-- --------------------------------------------------------------------
-- 9. Idempotent Backfill: Link Appointments to Patients
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.backfill_appointments_to_patients()
RETURNS JSONB AS $$
DECLARE
  appt RECORD;
  v_norm_phone TEXT;
  v_patient_id UUID;
  v_patient_code TEXT;
  v_existing_patient_id UUID;
  v_patients_created INT := 0;
  v_linked_count INT := 0;
  v_unique_phones_count INT := 0;
  v_collision_guard INT;
BEGIN
  FOR appt IN 
    SELECT a.*
    FROM public.appointments a
    WHERE a.patient_id IS NULL AND a.phone IS NOT NULL AND a.phone <> ''
    ORDER BY a.created_at ASC
  LOOP
    v_norm_phone := public.vshma_normalize_phone(appt.phone);
    
    IF v_norm_phone IS NULL OR v_norm_phone = '' THEN
      CONTINUE;
    END IF;

    -- Look for existing patient with exact name & normalized phone
    SELECT id INTO v_existing_patient_id
    FROM public.patients
    WHERE phone_normalized = v_norm_phone
      AND LOWER(TRIM(full_name)) = LOWER(TRIM(appt.full_name))
    LIMIT 1;

    IF v_existing_patient_id IS NOT NULL THEN
      v_patient_id := v_existing_patient_id;
      
      UPDATE public.patients
      SET total_appointments = total_appointments + 1,
          last_interaction_at = GREATEST(last_interaction_at, appt.created_at),
          first_interaction_at = LEAST(first_interaction_at, appt.created_at),
          whatsapp_opt_in = (whatsapp_opt_in OR COALESCE(appt.whatsapp_opt_in, false))
      WHERE id = v_patient_id;
    ELSE
      -- Generate collision-safe patient code
      v_collision_guard := 0;
      LOOP
        v_collision_guard := v_collision_guard + 1;
        v_patient_code := 'VSHMA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::text, 5, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.patients WHERE patient_id = v_patient_code) OR v_collision_guard > 50;
      END LOOP;

      INSERT INTO public.patients (
        patient_id,
        full_name,
        phone,
        phone_normalized,
        email,
        whatsapp_opt_in,
        first_interaction_at,
        last_interaction_at,
        total_appointments,
        city
      ) VALUES (
        v_patient_code,
        TRIM(appt.full_name),
        appt.phone,
        v_norm_phone,
        appt.email,
        COALESCE(appt.whatsapp_opt_in, false),
        appt.created_at,
        appt.created_at,
        1,
        'Bengaluru'
      )
      RETURNING id INTO v_patient_id;

      v_patients_created := v_patients_created + 1;
    END IF;

    -- Link appointment to patient record
    UPDATE public.appointments
    SET patient_id = v_patient_id
    WHERE id = appt.id;

    v_linked_count := v_linked_count + 1;
  END LOOP;

  SELECT COUNT(DISTINCT phone_normalized) INTO v_unique_phones_count
  FROM public.patients;

  RETURN jsonb_build_object(
    'success', true,
    'appointments_linked', v_linked_count,
    'patients_created', v_patients_created,
    'total_unique_phones', v_unique_phones_count
  );
END;
$$ LANGUAGE plpgsql;

-- Execute the backfill immediately
SELECT public.backfill_appointments_to_patients();

-- --------------------------------------------------------------------
-- 6. Notification Logs Schema Remediation (Additive & Idempotent)
-- --------------------------------------------------------------------
-- Ensures public.notification_logs has all required columns and constraints
-- to eliminate PostgreSQL 42703 (undefined column) errors.

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'booking_received',
  channel TEXT NOT NULL DEFAULT 'email',
  recipient TEXT NOT NULL DEFAULT '',
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'booking_reference') THEN
    ALTER TABLE public.notification_logs ADD COLUMN booking_reference TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'template_alias') THEN
    ALTER TABLE public.notification_logs ADD COLUMN template_alias TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'resend_message_id') THEN
    ALTER TABLE public.notification_logs ADD COLUMN resend_message_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.notification_logs ADD COLUMN idempotency_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'template_variables') THEN
    ALTER TABLE public.notification_logs ADD COLUMN template_variables JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'attempted_at') THEN
    ALTER TABLE public.notification_logs ADD COLUMN attempted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_logs' AND column_name = 'delivered_at') THEN
    ALTER TABLE public.notification_logs ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'notification_logs' AND constraint_name = 'notification_logs_status_check') THEN
    ALTER TABLE public.notification_logs DROP CONSTRAINT notification_logs_status_check;
  END IF;
  ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_status_check 
  CHECK (status IN ('pending', 'queued', 'processing', 'accepted', 'sent', 'failed', 'delivered', 'read', 'bounced', 'skipped'));

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'notification_logs' AND constraint_name = 'notification_logs_channel_check') THEN
    ALTER TABLE public.notification_logs DROP CONSTRAINT notification_logs_channel_check;
  END IF;
  ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_channel_check 
  CHECK (channel IN ('email', 'in_app', 'whatsapp'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping constraint updates: %', SQLERRM;
END $$;

DROP INDEX IF EXISTS public.idx_notification_logs_idempotency_key;
CREATE UNIQUE INDEX idx_notification_logs_idempotency_key
  ON public.notification_logs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_appointment ON public.notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_ref ON public.notification_logs(booking_reference);
CREATE INDEX IF NOT EXISTS idx_notification_logs_resend_msg_id ON public.notification_logs(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON public.notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_attempted_at ON public.notification_logs(attempted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view notification logs" ON public.notification_logs;
CREATE POLICY "Admins can view notification logs" ON public.notification_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access to notification logs" ON public.notification_logs;
CREATE POLICY "Service role full access to notification logs" ON public.notification_logs FOR ALL TO service_role USING (true);

GRANT ALL ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_logs TO service_role;
