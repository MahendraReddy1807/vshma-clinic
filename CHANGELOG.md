# Changelog — VSHMA Homeopathy Clinic

All notable changes to the VSHMA Homeopathy Clinic web platform and clinical CRM are documented here.

---

## [2.3.0] — 2026-11-21

### Multi-Channel Notification Engine & Automation System
- **Idempotent Data Model (`notification_jobs`)**: Every notification job carries a deterministic unique key `dedupe_key = appointment_id + ":" + event_type + ":" + channel + ":" + recipient_role`, completely preventing duplicate notifications across network retries, double clicks, and parallel cron triggers.
- **Provider Abstraction Architecture**:
  - `EmailProvider`: Resend integration with custom domain support and MIME attachments.
  - `WhatsAppProvider`: Standardized on Green API default (Instance `710722808462`) with Meta Cloud API selectable via env.
  - `SmsProvider`: MSG91 / Fast2SMS adapter behind `SMS_ENABLED=false` default with DLT template ID placeholders.
- **Strict Sandbox Isolation (`NOTIFY_MODE`)**:
  - Configurable as `"live" | "sandbox" | "dry-run"` (defaulting to `"sandbox"` outside live production).
  - In sandbox mode, all outgoing emails are securely redirected to `mahendrart07@gmail.com` and WhatsApp/SMS messages to `+91 7416001477` with clear redirect banners, protecting real patients during development.
  - Privacy masking permanently masks emails and phone numbers in logs (`m***7@gmail.com`, `+91 ******1477`).
- **Atomic Dispatcher Endpoint (`/api/cron/dispatch`)**:
  - Protected by `CRON_SECRET` and authenticated admin session headers.
  - Claims due jobs atomically, executes provider dispatch, handles exponential retry backoff (1m, 5m, 15m, 30m, 1h, max 5 attempts), and marks permanent failures for admin attention.
- **Quiet Hours Protection**: Automatically enforces 9:00 PM – 7:00 AM IST quiet hours. Patient reminders scheduled during quiet hours are held and released at 7:05 AM IST.
- **Opt-Out & Consent Handling**: DPDP Act & TRAI compliant opt-out registry (`opt_out_registry`) that honours incoming "STOP" replies and automatically skips marketing and reminder jobs.

### Luxury Message Templates (Phases 3 & 4)
- **13 Production Luxury Email Templates**: 600px bulletproof table layout with bone background (`#F7F3EC`), forest header band (`#121A15`), cream voucher card (`#FAF8F5`) with dashed divider, brass reference badge (`#B89B5E`), Georgia/Cambria typography, sage detail rows, dark mode support (`prefers-color-scheme`), and plain text fallback.
- **Interactive Email Preview Route (`/admin/emails/preview`)**: Full administrative preview suite with mobile/desktop frame toggles, HTML/Text tabs, and one-click "Send Test Email" to verify live inbox delivery.
- **WhatsApp & SMS Templates**: Formatted in IST with Meta-ready variables (`{{1}}`, `{{2}}`) and DLT placeholders under 160 characters.

### Full-Screen Booking Success Experience (Phase 5)
- **`BookingSuccessModal.tsx`**:
  - Animated signature half-circle mark assembling and completing into a full circle with soft brass aura.
  - Restrained floating pearl and botanical leaf particles (with reduced-motion accessibility fallback).
  - Glass consultation voucher card with reference code, copy-to-clipboard button, and doctor details.
  - One-click Google Calendar integration and downloadable `.ics` calendar file.
  - Instant WhatsApp sharing button and printable voucher card.
  - Three-line "What happens next" patient onboarding walkthrough.

### Admin Panel Upgrades (Phase 7)
- **Notification Center (`/admin/notifications`)**:
  - Real-time `NOTIFY_MODE` sandbox status indicator.
  - "Run Dispatcher Now" emergency trigger button with instant feedback.
  - Delivery health metrics (Queued Due, Delivered Sent, Failed / Errors, Opt-out Skipped).
  - Active jobs queue with one-click Retry button for failed attempts.
  - Channel filter (All, Email, WhatsApp, SMS) and status filter (All, Queued, Sent, Failed, Skipped).
- **Settings & Rules (`/admin/settings`)**:
  - Clinic alert emails and doctor WhatsApp routing controls.
  - Automated reminder offset toggles (24h, 2h, 1h, 10min, doctor alerts, 8:00 AM daily digest).
  - Quiet hours configuration display and SMS adapter DLT template status.

---

## [2.2.0] — 2026-11-21

### Viewport-Fit Layout System & 6 Full-Screen Chapters
- **Dynamic `--nav-h`**: Real navbar height measured dynamically via `ResizeObserver` and stored on `:root`.
- **Global Viewport-Fit Screen Utilities**: Defined `.screen` and `.screen-chapter` sized to `calc(100svh - var(--nav-h))` using `svh/dvh` to ensure mobile browser address bars and desktop short displays (1366x768, 1536x864, 1920x1009) display complete chapters without vertical clipping.
- **Fluid Typography**: Sized section titles using `clamp(2rem, min(4.8vw, 7.5vh), 4.25rem)` so headers scale proportionally to screen height as well as width.
- **GSAP Pinned Offset & Proximity Snapping**: Updated pinned sections to start at `top top+=${navH}`, with `pinSpacing: true`, `anticipatePin: 1`, and desktop-only proximity snapping.
- **Ancestor Transform Elimination**: Removed residual CSS transforms from `template.tsx` and layout wrappers upon animation completion to protect fixed positioning and GSAP pins.
- **Theme-Aware Navbar**: Integrated real-time section theme tracking (`data-nav-theme="dark"` / `"light"`), transitioning with smooth 400ms cubic-bezier curve from transparent hero to dark forest or bone frosted glass.
- **Consolidated Floating Dock (`FloatingDock.tsx`)**: Replaced scattered individual floating buttons (WhatsApp, Care Assistant, Book pill, mobile sticky bar) with a single bottom-right expandable capsule, including smart in-page booking button detection.
- **Admin Command Palette (`AdminCommandPalette.tsx`)**: Built keyboard-accessible staff command menu (Ctrl+K / ⌘K) for quick navigation across overview, inbox, appointments, and directory.

## [2.1.0] — 2026-11-21

### Luxury Motion & 3D Layer (₹5L Grade Experience)
- **Lenis Smooth Scroll & Single RAF**: Integrated `lenis` wired directly to GSAP `ScrollTrigger` in a unified requestAnimationFrame loop. Automatically disabled on touch screens and reduced-motion settings.
- **Three.js Hero 3D Scene**: Custom `@react-three/fiber` canvas loaded dynamically post-LCP (`ssr: false`) with:
  - Instanced floating pearl globules with pearly clearcoat sheen.
  - Procedural bezier botanical leaves swaying and tumbling.
  - Thin transmission glass spheres refracting ambient lightformers (no external HDR network requests).
  - Mouse parallax and camera scroll dolly dissolution.
- **Device Capability Tiers (`useCapability.ts`)**: Built `useSyncExternalStore` detecting CPU concurrency, memory, touch capabilities, and `prefers-reduced-motion` to degrade seamlessly across `high`, `mid`, and `low` tiers.
- **Tactile Micro-Interactions**:
  - `PillButton`: Spring-based magnetic cursor attraction on desktop.
  - `SageCard`: 3D perspective tilt up to 8° with dynamic radial light reflection.
  - `ConsultationsSection`: Pinned horizontal scrub on desktop; responsive tactile accordion on mobile.
  - `CustomCursor`: Smooth lerped cursor ring with clickable expansion state.
- **Route Curtain Transition (`src/app/template.tsx`)**: 650ms deep forest wipe with golden emblem between page navigations.
- **Multi-Step Booking Flow**: Rebuilt booking into a clear 5-step flow with animated closing circle confirmation and zero obstruction to conversion.

### Content, Trust & Medical Compliance
- **Medical Claims Softening**: Audited and softened claims in accordance with National Commission for Homeopathy (NCH) regulations (replacing "relief", "cure", and "steroid" assertions with constitutional case evaluations and individualized guidance).
- **DPDP Act 2023 Compliance**: Updated [`/privacy`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/app/privacy/page.tsx) and [`/terms`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/app/terms/page.tsx) with explicit Data Fiduciary notices, Grievance Officer details (`care@vshma.in`), and right to withdraw consent.
- **Structured Data SEO**: Added Google-compliant JSON-LD schemas (`MedicalClinic` and `Physician`) to `RootLayout`.
- **Client Review Document**: Created [`CLIENT-REVIEW.md`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/CLIENT-REVIEW.md) specifying pending practitioner details (Council Registration Number, full clinic street address, and fee schedule).

### Pre-Requisite & Bug Fixes
- **Reframed Doctor Portrait**: Resampled and reframed Dr. Chihnitha Reddy T's portrait with `sharp` (800x860) to eliminate ceiling fan and wall clutter, perfectly centering her face and stethoscope. Moved identity plaque underneath the frame.
- **Green API Standardized**: Set Green API as the universal default provider, eliminating Meta Cloud API credential requirements and 466 provider errors.
- **Admin Clean-up**: Removed dev `PHASE` badges from the admin sidebar navigation and unified the Patient Inbox into a 3-panel workspace.
