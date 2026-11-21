# Changelog — VSHMA Homeopathy Clinic

All notable changes to the VSHMA Homeopathy Clinic web platform and clinical CRM are documented here.

---

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
