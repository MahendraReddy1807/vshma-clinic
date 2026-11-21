# VSHMA Notification Engine Documentation

## 1. Overview
The VSHMA Notification Engine is an idempotent, resilient multi-channel notification dispatcher built for VSHMA Homeopathy Clinic.
- **Timezone**: `Asia/Kolkata` (IST)
- **Primary Channels**: Email (Resend / Custom Domain), WhatsApp (Green API Default, Meta Optional), SMS (MSG91 / Fast2SMS, Default: Disabled).
- **Core Principle**: Each notification job is recorded with a deterministic `dedupe_key`:
  `dedupe_key = appointment_id + ":" + event_type + ":" + channel + ":" + recipient_role`
  This guarantees that even with network retries, race conditions, or repeated triggers, no patient, doctor, or staff member ever receives a duplicate message.

---

## 2. Modes & Sandbox Isolation (`NOTIFY_MODE`)

Configure `NOTIFY_MODE` in `.env.local` or Vercel environment variables:
* **`sandbox` (Default outside live production)**:
  - All outgoing emails are redirected to the test allowlist: `mahendrart07@gmail.com`.
  - All outgoing WhatsApp and SMS messages are redirected to: `+91 7416001477`.
  - Original recipient addresses and phone numbers are clearly noted in the message headers/prefixes for easy QA.
* **`dry-run`**:
  - No network calls are made to external providers. Messages and masked payloads are logged to console.
* **`live`**:
  - Direct delivery to real patients and clinic staff. Only active when explicitly set.

### Privacy & Masking
Full phone numbers, emails, and sensitive health information are **never logged**.
All logs store masked values (e.g., `m***7@gmail.com`, `+91 ******1477`).

---

## 3. Dispatcher Endpoint & Cron Schedule

### Dispatcher Endpoint
* **Route**: `/api/cron/dispatch`
* **Methods**: `GET`, `POST`
* **Security**: Protected by `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`. Also accepts authenticated staff administrator sessions.

### Setting up Upstash QStash (Preferred 1-Minute Cadence)
Upstash QStash enables exact sub-minute and 1-minute crons on serverless infrastructure:
1. Go to [Upstash Console](https://console.upstash.com/qstash).
2. Create a Schedule:
   - **Destination**: `https://vshma-clinic.vercel.app/api/cron/dispatch`
   - **Cron Expression**: `* * * * *` (every minute)
   - **Headers**:
     - `Authorization`: `Bearer YOUR_CRON_SECRET`
     - `Content-Type`: `application/json`

### Alternative: Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/dispatch",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 4. Quiet Hours & Patient Protection
* **Quiet Hours**: 9:00 PM to 7:00 AM IST.
* Patient reminders scheduled during quiet hours are automatically pushed forward to **7:05 AM IST** the following morning to protect patients from late-night disturbances.
* Immediate transactional confirmations (e.g., a patient booking at 10 PM) are sent immediately.

---

## 5. Opt-Out & Consent (DPDP Act & TRAI Compliance)
* Booking form requires plain-language consent for WhatsApp and transactional communication.
* Inbound "STOP" or "UNSUBSCRIBE" messages add the patient's phone number to `public.opt_out_registry`.
* The dispatcher automatically checks the registry and marks matching WhatsApp and SMS jobs as `skipped`.
