# VSHMA Homeopathy Clinic

Responsive clinic website and appointment request portal for VSHMA, led by Dr. Chihnitha Reddy T (BHMS), in Bengaluru. Appointment records and administrator access use Supabase. The public booking form does not collect medical histories or diagnoses.

## Local setup

Requirements: Node.js 20.9 or newer and a Supabase project.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The development server runs at `http://localhost:3007`.

Set these variables in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GMAIL_USER=your_clinic_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_google_app_password
ADMIN_NOTIFICATION_EMAIL=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GMAIL_APP_PASSWORD` as a `NEXT_PUBLIC_` variable or commit `.env.local`. Enable 2-Step Verification on your Google Account, generate a 16-character Google App Password, and paste it with no spaces into `.env.local` and Vercel environment variables.

Set `ADMIN_NOTIFICATION_EMAIL` to the clinic's confirmed, authorized admin inbox before enabling admin email notifications. Leave it blank until that address is provided. A blank or malformed value is rejected by the email sender and recorded as a failed notification; appointment creation may still succeed, but the application does not report that email as sent.

## Supabase database and administrator

Run the SQL migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_create_tables.sql`
2. `supabase/migrations/002_create_admin.sql` (operator instructions)
3. `supabase/migrations/003_tighten_access_policies.sql`
4. `supabase/migrations/004_signature_modules.sql`
5. `supabase/migrations/20261120072037_vshma_resend_email_idempotency.sql`
6. `supabase/migrations/20261120090000_vshma_whatsapp_notifications.sql`
7. `supabase/migrations/20261120100000_vshma_crm_patients_schema.sql`
8. `supabase/migrations/20261120110000_vshma_conversations_inbox_schema.sql`
9. `supabase/migrations/20261120120000_vshma_crm_security_and_corrections.sql`
10. `supabase/migrations/20261120130000_vshma_email_verification_and_whatsapp_consent.sql`
11. `supabase/migrations/20261120140000_vshma_notification_logs_schema_fix.sql`

Create an administrator in Supabase Authentication, using a strong password and email confirmation. Copy that user's UUID, then run:

```sql
INSERT INTO public.admin_profiles (id, email, role)
VALUES ('AUTH_USER_UUID', 'AUTH_USER_EMAIL', 'admin');
```

Replace both values with the administrator's actual Supabase Auth UUID and email. Only users with an `admin` profile can use the admin API. The app does not contain default credentials. Sign in at `/admin/login`; use the password reset link there if needed. Configure the Supabase Auth password recovery redirect URL for your deployment (for example, `https://your-domain.example/admin/login`).

## Gmail SMTP Email Delivery

Outbound transactional emails are delivered directly via Gmail SMTP (`smtp.gmail.com:465`) through Nodemailer.

1. Enable 2-Step Verification on the clinic's Google Account.
2. Generate a 16-character Google App Password (select App: 'Mail', Device: 'Other/Custom').
3. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env.local` and in Vercel environment variables.
4. Preview all 13 light-first email templates and test live sends at `/admin/emails/preview`.
5. Run the SMTP connection handshake test at `/admin/notifications` via the "Test Gmail Connection" button.
6. A 500 emails/day quota is monitored, alerting in the admin portal when 80% is reached.

## Main routes and behavior

- `/` — clinic profile, service information, booking, contact, and medical disclaimer.
- `/about`, `/treatments`, and `/contact` — direct pages for the doctor profile, consultation options, and clinic contact form.
- `/book` — appointment request. A unique booking reference is created only after the database insert succeeds; then the page offers a user-initiated pre-filled WhatsApp message to `+91 7416001477`.
- `/privacy` and `/terms` — privacy information and site terms.
- `/admin/login`, `/admin/dashboard`, `/admin/appointments` — Supabase Auth administrator portal and appointment management.
- `/sitemap.xml` and `/robots.txt` — search indexing metadata.

The clinic street address, portrait, biography, experience, registration information, email, and hours were not provided. Add verified details before publishing those fields. Services are editable in `src/lib/constants.ts`.

## Checks

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

End-to-end booking and administrator checks require a configured Supabase project and an authorized admin profile. Verify a booking is present in `appointments`, that anonymous reads fail, that an admin can update/delete records, and that WhatsApp opens with a pre-filled message that the patient must manually send.

## Vercel deployment

Import the repository into Vercel and configure all four environment variables in Project Settings, replacing `NEXT_PUBLIC_SITE_URL` with the production HTTPS origin. Apply the migrations to the production Supabase project and provision its administrator separately. Add the production Auth redirect URL in Supabase. Deploy, then review booking insertion, login, appointment management, password reset, mobile layout, and legal contact details before launch.

## Medical disclaimer

Information on this website is provided for general informational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Patients should consult appropriately qualified healthcare professionals. Do not delay or discontinue evidence-based medical care based on information on this website.
