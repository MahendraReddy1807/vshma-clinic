-- Delivery metadata and durable deduplication for hosted Resend templates.
-- This migration only changes schema; it does not rewrite existing log rows.
ALTER TABLE public.notification_logs
  ADD COLUMN IF NOT EXISTS booking_reference TEXT,
  ADD COLUMN IF NOT EXISTS template_alias TEXT,
  ADD COLUMN IF NOT EXISTS resend_message_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_logs_idempotency_key
  ON public.notification_logs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
