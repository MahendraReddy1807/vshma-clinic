-- ============================================================
-- VSHMA CLINIC — PRODUCTION SQL QUERIES & ADMIN RUNBOOK
-- Target Database: PostgreSQL 15+ / Supabase
-- Project Ref: uzhofqzyrjuysajycbhs
-- ============================================================

-- ============================================================
-- 1. ADMIN USER ONBOARDING & PROMOTION
-- ============================================================
-- After a staff member or doctor registers in Supabase Auth:
-- Dashboard -> Authentication -> Users -> Add User -> Auto-confirm
-- Run this query to assign them the 'admin' role:
INSERT INTO public.admin_profiles (id, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with auth.users UUID
  'doctor@vshma.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- View all registered authorized administrators:
SELECT id, email, role, created_at
FROM public.admin_profiles
ORDER BY created_at DESC;


-- ============================================================
-- 2. APPOINTMENTS — DASHBOARD METRICS & ANALYTICS
-- ============================================================

-- A. Practice Summary Counts (Pending, Confirmed, Rescheduled, Completed, Cancelled)
SELECT 
  COUNT(*) AS total_appointments,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_count,
  COUNT(*) FILTER (WHERE status = 'rescheduled') AS rescheduled_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
FROM public.appointments;

-- B. Upcoming Appointments for Today and Tomorrow (Asia/Kolkata timezone)
SELECT 
  booking_reference,
  full_name,
  phone,
  email,
  appointment_date,
  preferred_time,
  consultation_type,
  status
FROM public.appointments
WHERE appointment_date IN (
  (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE,
  ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 day')::DATE
)
AND status IN ('pending', 'confirmed', 'rescheduled')
ORDER BY appointment_date ASC, preferred_time ASC;

-- C. Appointments by Consultation Focus Area
SELECT 
  consultation_type,
  COUNT(*) AS total_patients,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS percentage
FROM public.appointments
GROUP BY consultation_type
ORDER BY total_patients DESC;

-- D. Search Patient Record by Phone Number or Reference Code
SELECT 
  id,
  booking_reference,
  full_name,
  phone,
  email,
  age,
  appointment_date,
  preferred_time,
  rescheduled_date,
  rescheduled_time,
  consultation_type,
  status,
  message,
  created_at
FROM public.appointments
WHERE phone ILIKE '%9845%' OR booking_reference ILIKE '%VSHMA%'
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================
-- 3. AUTOMATED REMINDER ENGINE QUERIES (CRON WORKER)
-- ============================================================

-- A. Fetch All Due Reminder Jobs Ready for Email Dispatch
SELECT 
  j.id AS job_id,
  j.appointment_id,
  j.reminder_type,
  j.scheduled_for,
  a.booking_reference,
  a.full_name AS patient_name,
  a.email AS patient_email,
  a.phone AS patient_phone,
  a.appointment_date,
  a.preferred_time,
  a.consultation_type
FROM public.reminder_jobs j
JOIN public.appointments a ON a.id = j.appointment_id
WHERE j.status = 'pending'
  AND j.scheduled_for <= NOW()
  AND a.status IN ('confirmed', 'rescheduled')
  AND a.email IS NOT NULL
ORDER BY j.scheduled_for ASC
LIMIT 50;

-- B. Mark Due Jobs as 'processing' (Prevents concurrent duplicate dispatches)
UPDATE public.reminder_jobs
SET status = 'processing', updated_at = NOW()
WHERE id IN ('YOUR_DUE_JOB_UUID_HERE')
  AND status = 'pending';

-- C. Mark Reminder Job as 'completed'
UPDATE public.reminder_jobs
SET status = 'completed', updated_at = NOW()
WHERE id = 'YOUR_DUE_JOB_UUID_HERE';

-- D. View All Pending Reminders Scheduled in the Next 48 Hours
SELECT 
  j.id,
  a.booking_reference,
  a.full_name,
  j.reminder_type,
  j.scheduled_for,
  j.status
FROM public.reminder_jobs j
JOIN public.appointments a ON a.id = j.appointment_id
WHERE j.scheduled_for BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
ORDER BY j.scheduled_for ASC;


-- ============================================================
-- 4. NOTIFICATION DELIVERY LOGS & AUDIT TRAIL
-- ============================================================

-- A. Recent 50 Transactional Email Dispatches
SELECT 
  id,
  appointment_id,
  notification_type,
  recipient,
  subject,
  channel,
  status,
  retry_count,
  sent_at,
  created_at
FROM public.notification_logs
ORDER BY created_at DESC
LIMIT 50;

-- B. Identify Any Failed Emails Needing Manual Resend
SELECT 
  id,
  appointment_id,
  recipient,
  notification_type,
  error_message,
  retry_count,
  created_at
FROM public.notification_logs
WHERE status = 'failed'
ORDER BY created_at DESC;

-- C. Reset Retry Counter for Failed Email
UPDATE public.notification_logs
SET status = 'pending', retry_count = retry_count + 1
WHERE id = 'FAILED_LOG_UUID_HERE';


-- ============================================================
-- 5. REAL-TIME ADMIN DASHBOARD NOTIFICATIONS
-- ============================================================

-- A. Unread Admin Notifications Count
SELECT COUNT(*) AS unread_alerts_count
FROM public.admin_notifications
WHERE is_read = false;

-- B. View Latest 20 Alerts with Appointment Reference
SELECT 
  n.id,
  n.appointment_id,
  n.title,
  n.message,
  n.type,
  n.is_read,
  n.created_at,
  a.booking_reference
FROM public.admin_notifications n
LEFT JOIN public.appointments a ON a.id = n.appointment_id
ORDER BY n.created_at DESC
LIMIT 20;

-- C. Mark Single Alert as Read
UPDATE public.admin_notifications
SET is_read = true
WHERE id = 'ALERT_UUID_HERE';

-- D. Mark All Alerts as Read
UPDATE public.admin_notifications
SET is_read = true
WHERE is_read = false;


-- ============================================================
-- 6. CLINIC KNOWLEDGE BASE MANAGEMENT
-- ============================================================

-- A. Query Approved FAQs for AI Care Assistant Grounding
SELECT id, category, question, answer
FROM public.clinic_knowledge_base
WHERE is_active = true 
  AND is_doctor_approved = true
ORDER BY category ASC, created_at ASC;

-- B. Keyword Search Across Questions and Answers
SELECT id, category, question, answer, is_doctor_approved
FROM public.clinic_knowledge_base
WHERE question ILIKE '%consultation%' OR answer ILIKE '%consultation%'
ORDER BY created_at DESC;

-- C. Toggle Doctor Approval Status
UPDATE public.clinic_knowledge_base
SET is_doctor_approved = NOT is_doctor_approved,
    last_reviewed_at = NOW(),
    updated_at = NOW()
WHERE id = 'FAQ_UUID_HERE';


-- ============================================================
-- 7. AUTOMATION SETTINGS & EMERGENCY PAUSE
-- ============================================================

-- View Current Automation Settings
SELECT key, value, description, updated_at
FROM public.automation_settings
ORDER BY key ASC;

-- Toggle Master Emergency Email Pause (Stops all outgoing patient emails immediately)
UPDATE public.automation_settings
SET value = true, updated_at = NOW()
WHERE key = 'emergency_email_pause';

-- Resume Normal Email Sending
UPDATE public.automation_settings
SET value = false, updated_at = NOW()
WHERE key = 'emergency_email_pause';


-- ============================================================
-- 8. SYSTEM INTEGRITY & RLS VALIDATION CHECKS
-- ============================================================

-- Verify RLS is enabled on all public clinic tables:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'appointments',
    'admin_profiles',
    'notification_logs',
    'reminder_jobs',
    'clinic_knowledge_base',
    'admin_notifications',
    'automation_settings'
  );

-- Verify Realtime CDC Publications:
SELECT pubname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';


-- ============================================================
-- 9. POSTGRES BEST PRACTICES & PERFORMANCE DIAGNOSTICS
-- ============================================================

-- A. Audit Missing Foreign Key Indexes (Should return 0 rows for optimal CASCADE performance)
SELECT
  conrelid::regclass AS table_name,
  a.attname AS fk_column,
  c.conname AS constraint_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND conrelid::regnamespace = 'public'::regnamespace
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );

-- B. Cache Hit Ratio (Should ideally be > 99%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  ROUND((sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)), 2) as hit_ratio_pct
FROM pg_statio_user_tables;

-- C. Table Size & Row Estimates
SELECT
  relname AS table_name,
  n_live_tup AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC;

-- D. Inspect Active Connections and Queries (Asia/Kolkata timestamps)
SELECT
  pid,
  usename,
  client_addr,
  state,
  NOW() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state != 'idle' 
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_start ASC;
