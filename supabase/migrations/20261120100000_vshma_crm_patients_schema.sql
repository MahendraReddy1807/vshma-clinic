-- ====================================================================
-- VSHMA CLINIC CRM DATABASE MIGRATION - 20261120100000
-- Module: Patients CRM, Patient Notes, Activity Timeline & Safe Backfill
--
-- Strict Constraints:
-- 1. Family Phone Support: Does NOT enforce unique phone constraint on patients.
-- 2. Safe Backfill: Links historical appointments to patients by (phone_normalized, full_name).
--    Flags ambiguous/shared family numbers without destructive merging.
-- 3. RLS & Fail-Closed Security: Read/write access strictly limited to authenticated admins.
--
-- DO NOT EXECUTE ON LIVE PRODUCTION WITHOUT EXPLICIT APPROVAL
-- ====================================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL, -- Human readable: VSHMA-P-YYYYMM-XXXX
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL, -- Digits-only (E.164 without '+' or 10-digit standard)
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

-- Indexes for fast CRM lookup and search
CREATE INDEX IF NOT EXISTS idx_patients_phone_norm ON public.patients(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_opt_in ON public.patients(whatsapp_opt_in);
CREATE INDEX IF NOT EXISTS idx_patients_created ON public.patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_ambiguous ON public.patients(is_flagged_ambiguous);

-- 2. Extend Appointments Table with Foreign Key to Patients
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

-- 3. Patient Activity Timeline Table
CREATE TABLE IF NOT EXISTS public.patient_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'patient_created', 'appointment_booked', 'appointment_confirmed', 'appointment_rescheduled', 'appointment_cancelled', 'appointment_completed', 'note_added', 'whatsapp_opt_in_updated'
  reference_id UUID,           -- e.g. appointment_id or note_id
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  actor TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patient_activity_patient ON public.patient_activity(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_activity_type ON public.patient_activity(activity_type);

-- 4. Patient Administrative Notes Table
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Restricted strictly to authenticated admin_profiles (role = 'admin')
CREATE POLICY "Admins can view patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can insert patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can view patient activity"
  ON public.patient_activity FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can insert patient activity"
  ON public.patient_activity FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can view patient notes"
  ON public.patient_notes FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can insert patient notes"
  ON public.patient_notes FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can update own patient notes"
  ON public.patient_notes FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.admin_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Revoke all permissions from anon
REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.patient_activity FROM anon;
REVOKE ALL ON public.patient_notes FROM anon;

-- 7. Updated_at Trigger for patients & notes
DROP TRIGGER IF EXISTS on_patient_updated ON public.patients;
CREATE TRIGGER on_patient_updated
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_patient_note_updated ON public.patient_notes;
CREATE TRIGGER on_patient_note_updated
  BEFORE UPDATE ON public.patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 8. Safe Idempotent Backfill Procedure:
-- Links historical appointments to patients by (phone_normalized, TRIM(LOWER(full_name)))
-- Flags family members sharing the same phone number rather than destructively merging.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.backfill_appointments_to_patients()
RETURNS TABLE(created_patients INT, linked_appointments INT, flagged_ambiguous INT) AS $$
DECLARE
  v_created_count INT := 0;
  v_linked_count INT := 0;
  v_flagged_count INT := 0;
  r RECORD;
  v_patient_id UUID;
  v_norm_phone TEXT;
  v_distinct_names_count INT;
  v_names_list TEXT;
  v_is_ambiguous BOOLEAN;
  v_reason TEXT;
  v_code TEXT;
BEGIN
  -- Group appointments by distinct (normalized_phone, trimmed_full_name)
  FOR r IN (
    SELECT 
      REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS norm_phone,
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
    GROUP BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), TRIM(LOWER(full_name)), TRIM(full_name)
  ) LOOP
    v_norm_phone := r.norm_phone;
    
    -- Check if multiple distinct names share this same normalized phone
    SELECT 
      COUNT(DISTINCT TRIM(LOWER(full_name))),
      STRING_AGG(DISTINCT TRIM(full_name), ', ')
    INTO v_distinct_names_count, v_names_list
    FROM public.appointments
    WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = v_norm_phone;

    IF v_distinct_names_count > 1 THEN
      v_is_ambiguous := true;
      v_reason := 'Shared family phone number with: ' || v_names_list;
      v_flagged_count := v_flagged_count + 1;
    ELSE
      v_is_ambiguous := false;
      v_reason := NULL;
    END IF;

    -- Check if patient record already exists for this (norm_phone, name)
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE phone_normalized = v_norm_phone
      AND LOWER(TRIM(full_name)) = LOWER(TRIM(r.patient_name))
    LIMIT 1;

    IF v_patient_id IS NULL THEN
      -- Generate patient code: VSHMA-P-YYYYMM-XXXX
      v_code := 'VSHMA-P-' || TO_CHAR(r.first_seen, 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 8999 + 1000)::TEXT, 4, '0');
      
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
      -- Update stats
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
    WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = v_norm_phone
      AND LOWER(TRIM(full_name)) = LOWER(TRIM(r.patient_name))
      AND (patient_id IS NULL OR patient_id <> v_patient_id);

    GET DIAGNOSTICS v_linked_count = ROW_COUNT;
  END LOOP;

  RETURN QUERY SELECT v_created_count, v_linked_count, v_flagged_count;
END;
$$ LANGUAGE plpgsql;
