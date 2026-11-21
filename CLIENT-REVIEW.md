# VSHMA Homeopathy Clinic — Client Review & Compliance Audit

This document is prepared for **Dr. Chihnitha Reddy T (BHMS)** and the VSHMA Clinic management team.
It outlines key details requiring practitioner confirmation, regulatory compliance notes under the **National Commission for Homeopathy (NCH) Regulations**, and the **Digital Personal Data Protection (DPDP) Act, 2023**.

---

## 1. Information Requiring Practitioner Confirmation

The codebase uses a strict **Single Source of Truth** (`src/lib/site-config.ts`).
No placeholder data is fabricated. The items below are currently marked as `TODO` and will automatically populate the site once confirmed:

| Item | Current Status | Recommended Value / Action | Location in Code |
| :--- | :--- | :--- | :--- |
| **Council Registration Number** | `null` | Please supply your State Council Registration Number (e.g., *Karnataka State Homeopathic Medical Council Reg No. XXXXX*). Required by patients and medical compliance. | `SITE_CONFIG.doctor.registrationNumber` |
| **Physical Clinic Address** | Bengaluru (General) | Exact building name, street, cross, locality, and postal PIN code (e.g., *#12, 4th Main, Indiranagar, Bengaluru, 560038*). | `SITE_CONFIG.clinic.fullAddress` |
| **Google Business Profile** | In preparation | Google Maps Place CID / URL for one-click navigation and Google review embeds. | `SITE_CONFIG.clinic.googleMapsPlaceUrl` |
| **Consultation Fee Schedule** | Disclosed on booking | State whether fees are fixed (e.g., *₹1,200 initial intake / ₹800 review*) or shared during appointment triage. | `SITE_CONFIG.fees` |
| **Years of Active Practice** | `null` | Verified years of clinical experience (e.g., *7+ Years of Dedicated Clinical Practice*). | `SITE_CONFIG.doctor.yearsExperience` |

---

## 2. Medical Advertising Compliance (NCH & Drugs and Magic Remedies Act)

Under the **National Commission for Homeopathy Act** and Indian medical ethics:
- **No Claim of Cure**: Indian medical practitioners are prohibited from making claims of absolute cures or miracle outcomes.
- **Audit Performed**: All website copy has been softened from curative claims to constitutional consultation descriptions:
  - *"Relief of chronic bloating"* &rarr; *"Constitutional evaluation for recurring gastric discomfort & motility rhythms"*
  - *"Care for PCOS"* &rarr; *"Supportive constitutional consultations addressing cycle regularity & hormonal rhythms"*
  - *"Without topical steroids"* &rarr; *"Gentle internal therapeutic approach and root-cause constitutional case taking"*
- **Disclaimer**: The footer, booking flows, and Care Assistant now carry clear disclaimers that consultations and digital communications do not replace immediate emergency care.

---

## 3. Data Privacy & Patient Confidentiality (DPDP Act 2023)

- **Consent-First Communication**: WhatsApp notifications are strictly opt-in (`whatsapp_opt_in = true` required by user checkbox).
- **Independent Admin Alerts**: Clinic reception alerts for new bookings run independently of patient WhatsApp consent, ensuring no appointment is missed.
- **Provider Redundancy**: WhatsApp infrastructure is standardized on **Green API** (Instance `710722808462`). Meta Cloud API credentials are never demanded or required.
- **Right to Withdraw**: Patients can revoke WhatsApp consent at any time via reply or via the admin dossier with one click.

---

## 4. Copy Clean-Up & Plain Language Audit (Phase 4 Approval)

The following wording refinements were implemented across the public site to eliminate developer labels, soften claims, and limit repetitive academic medical jargon:

| Section / Element | Previous Phrasing | Refined Plain-Language Phrasing | Reason / Policy |
| :--- | :--- | :--- | :--- |
| **Philosophy Header** | *"Care rooted in personal dialogue and constitutional rigour"* | *"Care starts with listening"* | Calmer, more human, memorable headline. |
| **Philosophy Card 01** | *"Totality Case Taking &bull; Constitutional Totality"* | *"Comprehensive Intake &bull; Personal Health Story"* | Replaces clinical repertory jargon with patient-friendly clarity. |
| **Philosophy Card 02** | *"Individualized Therapeutics &bull; Custom Formulation"* | *"Tailored Formulations &bull; Constitutional Matching"* | Limits overuse of "individualized". |
| **Skin Specialty** | *"Care focused on the internal totality of chronic skin flare-ups... without aggressive suppression"* | *"Consultation for chronic skin flare-ups, environmental triggers, and skin comfort"* | Removes adversarial claims ("suppression") and jargon ("totality"). |
| **Digestive Specialty** | *"Motility rhythms & chronic bloating relief"* | *"Consultation for recurring gastric discomfort, irregular motility, bloating patterns"* | Removes cure/relief claims; focuses on clinical consultation scope. |
| **Consultation Header** | *"Consultation Specialties &bull; Formats. Scroll to explore the 6 consultation formats..."* | *"Specialties &bull; Care Formats. Each clinical session provides dedicated time..."* | Removes dev instruction copy and eyebrow clutter. |
| **Jargon Frequency Limit** | Words *unhurried*, *constitutional*, *individualized*, *totality* previously appeared 20+ times across site | Reduced to **2–3 total uses** across the entire landing page and menu | Creates balanced, refined prose without repetitive buzzwords. |

---

## 5. Notification System & Production Launch Checklist

The production multi-channel notification engine is active in **Sandbox Mode** during development. To transition to **Live Production**, the clinic management team must execute the following steps:

### A. Domain Verification for Outgoing Email (`care@vshma.in`)
Log in to your DNS provider (e.g., Cloudflare, GoDaddy, Hostinger) for `vshma.in` and add the following Resend records:
1. **SPF Record**:
   - Type: `TXT`
   - Name: `bounces.vshma.in` (or `@`)
   - Value: `v=spf1 include:resend.com ~all`
2. **DKIM Record**:
   - Type: `CNAME`
   - Name: `resend._domainkey`
   - Value: (Generated by Resend dashboard)
3. **DMARC Record**:
   - Type: `TXT`
   - Name: `_dmarc.vshma.in`
   - Value: `v=DMARC1; p=none; rua=mailto:care@vshma.in`

### B. SMS & TRAI DLT Registration (When Enabling SMS Fallback)
1. Register VSHMA Clinic on a telecom DLT portal (Vilpower, Jio DLT, or Airtel DLT).
2. Register the Sender ID (e.g., `VSHMAC` or `VSHMAH`).
3. Submit the 3 pre-written transactional SMS templates:
   - **Booking Confirmed**: `VSHMA: Dear {#var#}, your appointment is confirmed for {#var#}. Ref: {#var#}. Reach 10m early. Help: 7416001477` (DLT Template ID: `DLT_VSHMA_CONFIRM_01`)
   - **2-Hour Reminder**: `VSHMA: Reminder: Consultation today at {#var#}. Please arrive 10m prior. Ref: {#var#}. VSHMA Clinic` (DLT Template ID: `DLT_VSHMA_REMIND_2H_02`)
   - **10-Minute Callout**: `VSHMA: Your consultation slot is now ready. Please proceed to the clinic desk. Ref: {#var#}` (DLT Template ID: `DLT_VSHMA_REMIND_10M_03`)
4. Set `SMS_ENABLED=true` and `MSG91_AUTH_KEY=...` in your production environment variables.

### C. Moving from Sandbox to Live Mode
When ready to begin messaging real patients:
1. Change `NOTIFY_MODE=live` in Vercel environment variables.
2. Ensure `CRON_SECRET` is set in Vercel.
3. Configure Upstash QStash or Vercel Cron to ping `/api/cron/dispatch` every minute.

### D. Photography to Supply
To replace architectural stock styling with authentic clinic imagery:
- **Consultation Room**: 1 high-resolution landscape photo of Dr. Chihnitha's consultation desk and medicine rack.
- **Reception / Waiting Area**: 1 photo of the entrance and reception counter.
- **Remedy Dispensation**: 1 close-up photo of glass homeopathic remedy vials or dilution bottles.

