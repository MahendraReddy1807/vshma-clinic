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
NEXT_PUBLIC_SITE_URL=http://localhost:3007
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_` variable or commit `.env.local`. Booking and administrator APIs remain unavailable until the Supabase variables are configured; they do not create simulated bookings.

## Supabase database and administrator

Run the SQL migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_create_tables.sql`
2. `supabase/migrations/002_create_admin.sql` (operator instructions)
3. `supabase/migrations/003_tighten_access_policies.sql`

Create an administrator in Supabase Authentication, using a strong password and email confirmation. Copy that user's UUID, then run:

```sql
INSERT INTO public.admin_profiles (id, email, role)
VALUES ('AUTH_USER_UUID', 'admin@example.com', 'admin');
```

Replace both sample values. Only users with an `admin` profile can use the admin API. The app does not contain default credentials. Sign in at `/admin/login`; use the password reset link there if needed. Configure the Supabase Auth password recovery redirect URL for your deployment (for example, `https://your-domain.example/admin/login`).

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
