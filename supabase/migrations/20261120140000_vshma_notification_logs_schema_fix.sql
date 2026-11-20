-- Additive repair for email and WhatsApp notification logging.
-- Requires public.notification_logs from migration 004_signature_modules.sql.
-- Existing rows are preserved; this migration does not update or delete row data.

DO $$
BEGIN
  IF to_regclass('public.notification_logs') IS NULL THEN
    RAISE EXCEPTION 'public.notification_logs is missing; apply migration 004_signature_modules.sql first';
  END IF;
END
$$;

ALTER TABLE public.notification_logs
  ADD COLUMN IF NOT EXISTS booking_reference TEXT,
  ADD COLUMN IF NOT EXISTS template_alias TEXT,
  ADD COLUMN IF NOT EXISTS resend_message_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Refuse to alter indexes if existing data already violates idempotency.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.notification_logs
    WHERE idempotency_key IS NOT NULL
    GROUP BY idempotency_key
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate notification_logs.idempotency_key values exist; resolve them before applying this migration';
  END IF;
END
$$;

-- Replace the earlier partial index with a full unique index. PostgreSQL still
-- permits multiple NULLs, and this form supports ON CONFLICT(idempotency_key).
DROP INDEX IF EXISTS public.idx_notification_logs_idempotency_key;
CREATE UNIQUE INDEX idx_notification_logs_idempotency_key
  ON public.notification_logs (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_notification_logs_resend_msg_id
  ON public.notification_logs (resend_message_id)
  WHERE resend_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_ref
  ON public.notification_logs (booking_reference)
  WHERE booking_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_logs_appointment_attempted
  ON public.notification_logs (appointment_id, attempted_at DESC);

-- Keep all lifecycle values used by the email sender, Resend webhook, and
-- WhatsApp notification workflows. Constraint failures abort instead of being
-- swallowed, preserving a clear migration error and all existing row data.
ALTER TABLE public.notification_logs
  DROP CONSTRAINT IF EXISTS notification_logs_status_check;
ALTER TABLE public.notification_logs
  ADD CONSTRAINT notification_logs_status_check
  CHECK (status IN (
    'pending',
    'queued',
    'processing',
    'accepted',
    'sent',
    'delivered',
    'bounced',
    'failed',
    'read',
    'skipped'
  ));

ALTER TABLE public.notification_logs
  DROP CONSTRAINT IF EXISTS notification_logs_channel_check;
ALTER TABLE public.notification_logs
  ADD CONSTRAINT notification_logs_channel_check
  CHECK (channel IN ('email', 'in_app', 'whatsapp'));

-- Ensure RLS is enabled on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notification logs" ON public.notification_logs;
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role full access to notification logs" ON public.notification_logs;
CREATE POLICY "Service role full access to notification logs"
  ON public.notification_logs FOR ALL
  TO service_role
  USING (true);

GRANT ALL ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_logs TO service_role;
