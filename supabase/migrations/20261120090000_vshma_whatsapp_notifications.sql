-- ====================================================================
-- Migration: 20261120090000_vshma_whatsapp_notifications.sql
-- Description: Adds WhatsApp opt-in preference to appointments table
--              and updates notification_logs check constraints for
--              Meta WhatsApp Cloud API delivery statuses and channel.
--
-- DO NOT EXECUTE ON LIVE PRODUCTION WITHOUT EXPLICIT APPROVAL
-- ====================================================================

-- 1. Add whatsapp_opt_in column to appointments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'whatsapp_opt_in'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT false;
    
    COMMENT ON COLUMN appointments.whatsapp_opt_in IS 'Whether the patient opted in to receive booking notifications and reminders via WhatsApp.';
  END IF;
END $$;

-- 2. Create index on whatsapp_opt_in for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_whatsapp_opt_in 
ON appointments(whatsapp_opt_in);

-- 3. Update notification_logs check constraints if existing
DO $$
BEGIN
  -- Drop existing status check if present to allow 'read' and 'delivered'
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notification_logs' AND constraint_name = 'notification_logs_status_check'
  ) THEN
    ALTER TABLE notification_logs DROP CONSTRAINT notification_logs_status_check;
  END IF;

  ALTER TABLE notification_logs 
  ADD CONSTRAINT notification_logs_status_check 
  CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'delivered', 'read'));

  -- Drop existing channel check if present to ensure 'whatsapp' is allowed
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notification_logs' AND constraint_name = 'notification_logs_channel_check'
  ) THEN
    ALTER TABLE notification_logs DROP CONSTRAINT notification_logs_channel_check;
  END IF;

  ALTER TABLE notification_logs 
  ADD CONSTRAINT notification_logs_channel_check 
  CHECK (channel IN ('email', 'in_app', 'whatsapp'));
EXCEPTION
  WHEN OTHERS THEN
    -- Table notification_logs may have different schema structure; handle safely
    RAISE NOTICE 'Skipping constraint modification: %', SQLERRM;
END $$;
