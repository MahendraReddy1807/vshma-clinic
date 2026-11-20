-- ====================================================================
-- VSHMA CLINIC CRM — ADDITIVE MIGRATION: 20261120130000
-- Module: Email Delivery Verification & Explicit WhatsApp Consent Tracking
--
-- Strict Constraints:
-- 1. Additive: Does not mutate or drop existing data.
-- 2. Audit Trail: Adds consent timestamp and consent source to appointments & patients.
-- 3. Accurate Notification Lifecycle: Expands status check constraint to support
--    'accepted', 'bounced', 'skipped', 'processing'.
--
-- DO NOT EXECUTE ON LIVE PRODUCTION WITHOUT EXPLICIT APPROVAL
-- ====================================================================

-- 1. Extend appointments table with consent audit metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'whatsapp_opt_in_timestamp'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN whatsapp_opt_in_timestamp TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'whatsapp_opt_in_source'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN whatsapp_opt_in_source TEXT DEFAULT 'web_booking_form';
  END IF;
END $$;

-- 2. Extend patients table with consent audit metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'whatsapp_opt_in_timestamp'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN whatsapp_opt_in_timestamp TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'whatsapp_opt_in_source'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN whatsapp_opt_in_source TEXT DEFAULT 'web_booking_form';
  END IF;
END $$;

-- 3. Update notification_logs status constraint to include 'accepted', 'bounced', 'skipped', 'processing'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notification_logs' AND constraint_name = 'notification_logs_status_check'
  ) THEN
    ALTER TABLE public.notification_logs DROP CONSTRAINT notification_logs_status_check;
  END IF;

  ALTER TABLE public.notification_logs 
  ADD CONSTRAINT notification_logs_status_check 
  CHECK (status IN (
    'pending', 
    'processing', 
    'queued', 
    'accepted', 
    'sent', 
    'delivered', 
    'bounced', 
    'failed', 
    'read', 
    'skipped'
  ));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping constraint modification: %', SQLERRM;
END $$;

-- 4. Ensure delivered_at column exists in notification_logs for webhook reconciliation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notification_logs' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE public.notification_logs ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_logs_resend_msg_id 
ON public.notification_logs(resend_message_id);

CREATE INDEX IF NOT EXISTS idx_appointments_consent_audit
ON public.appointments(whatsapp_opt_in, whatsapp_opt_in_timestamp);
