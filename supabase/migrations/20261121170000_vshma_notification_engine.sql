-- ====================================================================
-- Migration: 20261121170000_vshma_notification_engine.sql
-- Description: Core Notification Engine Schema
--              - notification_jobs (idempotent, prioritized, multi-channel)
--              - opt_out_registry (STOP handler for WhatsApp & SMS)
-- ====================================================================

-- 1. Create notification_jobs table
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('patient', 'doctor', 'clinic')),
  recipient_target TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'cancelled', 'skipped')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  last_error TEXT,
  provider_message_id TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Indexes for lightning fast cron dispatcher queries
CREATE INDEX IF NOT EXISTS idx_notification_jobs_dispatch 
  ON public.notification_jobs(status, scheduled_at) 
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_notification_jobs_appointment 
  ON public.notification_jobs(appointment_id);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_event 
  ON public.notification_jobs(event_type);

-- 2. Create opt_out_registry table
CREATE TABLE IF NOT EXISTS public.opt_out_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT DEFAULT 'STOP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opt_out_registry_phone 
  ON public.opt_out_registry(phone);

-- 3. Row Level Security
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opt_out_registry ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role access notification_jobs" ON public.notification_jobs;
CREATE POLICY "Service role access notification_jobs" 
  ON public.notification_jobs FOR ALL 
  TO service_role 
  USING (true);

DROP POLICY IF EXISTS "Service role access opt_out_registry" ON public.opt_out_registry;
CREATE POLICY "Service role access opt_out_registry" 
  ON public.opt_out_registry FOR ALL 
  TO service_role 
  USING (true);

-- Authenticated staff can view
DROP POLICY IF EXISTS "Staff can view notification_jobs" ON public.notification_jobs;
CREATE POLICY "Staff can view notification_jobs" 
  ON public.notification_jobs FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Staff can view opt_out_registry" ON public.opt_out_registry;
CREATE POLICY "Staff can view opt_out_registry" 
  ON public.opt_out_registry FOR SELECT 
  TO authenticated 
  USING (true);

GRANT ALL ON public.notification_jobs TO service_role;
GRANT ALL ON public.notification_jobs TO authenticated;
GRANT ALL ON public.opt_out_registry TO service_role;
GRANT ALL ON public.opt_out_registry TO authenticated;
