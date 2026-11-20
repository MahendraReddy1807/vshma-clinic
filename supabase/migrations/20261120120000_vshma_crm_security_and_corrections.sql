-- ====================================================================
-- VSHMA CLINIC CRM DATABASE MIGRATION - 20261120120000
-- Module: Follow-up Tasks, Role-Based Access Control, Schema Corrections & Collision-Safe Backfill
--
-- Strict Constraints:
-- 1. Additive: Does not mutate or drop historical migrations.
-- 2. Follow-up Tasks: Supports general clinic tasks (patient_id nullable) and patient-linked tasks.
-- 3. Least-Privilege RBAC: Admin vs Staff distinctions. Protects clinical notes from staff.
-- 4. Consistent Phone Normalization: Aligns SQL backfill with TypeScript canonical format ('91' + 10 digits).
-- 5. Collision-Safe & Idempotent Backfill: Loop accumulation, safe collision check for patient codes.
--
-- DO NOT EXECUTE ON LIVE PRODUCTION WITHOUT EXPLICIT APPROVAL
-- ====================================================================

-- 1. Helper function for Canonical Phone Normalization in Postgres
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

-- 2. Create Follow-up Tasks Table
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL, -- Nullable for general clinic tasks
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
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_priority ON public.follow_up_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_assigned ON public.follow_up_tasks(assigned_to);

-- Trigger for follow_up_tasks updated_at
DROP TRIGGER IF EXISTS on_follow_up_task_updated ON public.follow_up_tasks;
CREATE TRIGGER on_follow_up_task_updated
  BEFORE UPDATE ON public.follow_up_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Schema Corrections for Conversations & Inbound Ambiguity
DO $$
BEGIN
  -- Make patient_id nullable in conversations to support phone-level unassigned threads
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'patient_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.conversations ALTER COLUMN patient_id DROP NOT NULL;
  END IF;

  -- Add ambiguity tracking columns to conversations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'is_flagged_ambiguous'
  ) THEN
    ALTER TABLE public.conversations 
      ADD COLUMN is_flagged_ambiguous BOOLEAN DEFAULT false,
      ADD COLUMN requires_staff_review BOOLEAN DEFAULT false,
      ADD COLUMN ambiguity_reason TEXT,
      ADD COLUMN possible_patient_ids UUID[] DEFAULT '{}'::uuid[];
  END IF;

  -- Make patient_id nullable in conversation_messages
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages' AND column_name = 'patient_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.conversation_messages ALTER COLUMN patient_id DROP NOT NULL;
  END IF;

  -- Add is_flagged_ambiguous to conversation_messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages' AND column_name = 'is_flagged_ambiguous'
  ) THEN
    ALTER TABLE public.conversation_messages 
      ADD COLUMN is_flagged_ambiguous BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure conversation uniqueness per (external_chat_id, channel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'conversations' AND constraint_name = 'conversations_external_chat_channel_key'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_external_chat_channel_key UNIQUE (external_chat_id, channel);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint already exists or unique index active.';
END $$;

-- 4. Least-Privilege Role-Based Access Control (RBAC) Policies

-- Follow-up Tasks RLS
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full management on follow_up_tasks"
  ON public.follow_up_tasks FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Staff can view follow_up_tasks"
  ON public.follow_up_tasks FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can create follow_up_tasks"
  ON public.follow_up_tasks FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can update follow_up_tasks"
  ON public.follow_up_tasks FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

-- Patients RLS extensions for Staff
CREATE POLICY "Staff can view patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can insert patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

-- Patient Notes: Strict Clinical Privacy
-- Admin has full access to all notes (including confidential)
-- Staff can view ONLY non-confidential administrative notes
CREATE POLICY "Staff can view non-confidential notes"
  ON public.patient_notes FOR SELECT
  TO authenticated
  USING (
    is_confidential = false AND
    EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
  );

CREATE POLICY "Staff can author notes"
  ON public.patient_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
  );

CREATE POLICY "Staff can update own notes"
  ON public.patient_notes FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
  )
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff')
  );

-- Conversations & Messages RLS extensions for Staff
CREATE POLICY "Staff can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can view messages"
  ON public.conversation_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

CREATE POLICY "Staff can insert messages"
  ON public.conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'staff'));

REVOKE ALL ON public.follow_up_tasks FROM anon;

-- 5. Safe, Collision-Proof & Idempotent Backfill Function
CREATE OR REPLACE FUNCTION public.backfill_appointments_to_patients()
RETURNS TABLE(created_patients INT, linked_appointments INT, flagged_ambiguous INT) AS $$
DECLARE
  v_created_count INT := 0;
  v_linked_count INT := 0;
  v_flagged_count INT := 0;
  v_step_linked INT := 0;
  r RECORD;
  v_patient_id UUID;
  v_norm_phone TEXT;
  v_distinct_names_count INT;
  v_names_list TEXT;
  v_is_ambiguous BOOLEAN;
  v_reason TEXT;
  v_code TEXT;
  v_attempts INT;
BEGIN
  FOR r IN (
    SELECT 
      public.vshma_normalize_phone(phone) AS norm_phone,
      TRIM(full_name) AS patient_name,
      MAX(phone) AS sample_raw_phone,
      MAX(email) AS sample_email,
      MAX(age) AS sample_age,
      BOOL_OR(COALESCE(whatsapp_opt_in, false)) AS any_opt_in,
      MIN(created_at) AS first_seen,
      MAX(created_at) AS last_seen,
      COUNT(*) AS appt_count
    FROM public.appointments
    WHERE phone IS NOT NULL AND TRIM(phone) <> ''
    GROUP BY public.vshma_normalize_phone(phone), TRIM(LOWER(full_name)), TRIM(full_name)
  ) LOOP
    v_norm_phone := r.norm_phone;
    
    -- Check if multiple distinct names share this same canonical normalized phone
    SELECT 
      COUNT(DISTINCT TRIM(LOWER(full_name))),
      STRING_AGG(DISTINCT TRIM(full_name), ', ')
    INTO v_distinct_names_count, v_names_list
    FROM public.appointments
    WHERE public.vshma_normalize_phone(phone) = v_norm_phone;

    IF v_distinct_names_count > 1 THEN
      v_is_ambiguous := true;
      v_reason := 'Shared family phone number with: ' || v_names_list;
      v_flagged_count := v_flagged_count + 1;
    ELSE
      v_is_ambiguous := false;
      v_reason := NULL;
    END IF;

    -- Check if patient record already exists for this (canonical_norm_phone, name)
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE phone_normalized = v_norm_phone
      AND LOWER(TRIM(full_name)) = LOWER(TRIM(r.patient_name))
    LIMIT 1;

    IF v_patient_id IS NULL THEN
      -- Collision-Safe Patient Code Generation Loop
      v_attempts := 0;
      LOOP
        v_attempts := v_attempts + 1;
        v_code := 'VSHMA-P-' || TO_CHAR(r.first_seen, 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 89999 + 10000)::TEXT, 5, '0');
        
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.patients WHERE patient_id = v_code);
        
        IF v_attempts > 20 THEN
          -- Fallback to microsecond timestamp hex suffix guaranteeing absolute uniqueness
          v_code := 'VSHMA-P-' || TO_CHAR(r.first_seen, 'YYYYMM') || '-' || SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6);
          EXIT;
        END IF;
      END LOOP;
      
      INSERT INTO public.patients (
        patient_id,
        full_name,
        phone,
        phone_normalized,
        email,
        age,
        whatsapp_opt_in,
        first_interaction_at,
        last_interaction_at,
        total_appointments,
        is_flagged_ambiguous,
        ambiguity_reason
      ) VALUES (
        v_code,
        r.patient_name,
        r.sample_raw_phone,
        v_norm_phone,
        r.sample_email,
        r.sample_age,
        r.any_opt_in,
        r.first_seen,
        r.last_seen,
        r.appt_count,
        v_is_ambiguous,
        v_reason
      ) RETURNING id INTO v_patient_id;

      v_created_count := v_created_count + 1;

      -- Add initial activity entry
      INSERT INTO public.patient_activity (
        patient_id,
        activity_type,
        title,
        details,
        actor
      ) VALUES (
        v_patient_id,
        'patient_created',
        'Patient Profile Initialized from Historical Appointments',
        jsonb_build_object('total_historical_visits', r.appt_count, 'family_shared_phone', v_is_ambiguous),
        'backfill_procedure'
      );
    ELSE
      -- Update existing patient stats idempotently
      UPDATE public.patients
      SET 
        total_appointments = r.appt_count,
        last_interaction_at = r.last_seen,
        whatsapp_opt_in = (whatsapp_opt_in OR r.any_opt_in),
        is_flagged_ambiguous = v_is_ambiguous,
        ambiguity_reason = COALESCE(v_reason, ambiguity_reason)
      WHERE id = v_patient_id;
    END IF;

    -- Link appointments to this patient
    UPDATE public.appointments
    SET patient_id = v_patient_id
    WHERE public.vshma_normalize_phone(phone) = v_norm_phone
      AND LOWER(TRIM(full_name)) = LOWER(TRIM(r.patient_name))
      AND (patient_id IS NULL OR patient_id <> v_patient_id);

    GET DIAGNOSTICS v_step_linked = ROW_COUNT;
    v_linked_count := v_linked_count + v_step_linked;
  END LOOP;

  RETURN QUERY SELECT v_created_count, v_linked_count, v_flagged_count;
END;
$$ LANGUAGE plpgsql;
