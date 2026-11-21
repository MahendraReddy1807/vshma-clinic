# VSHMA Luxury Motion & 3D Architectural Architecture (`MOTION.md`)

## 1. Vision & Design Intent
The motion system at VSHMA Homeopathy Clinic is built to convey a calm, tactile, and deeply reassuring atmosphere matching the caliber of a ₹5L bespoke medical product. Motion is weighted, slow, and cinematic—never flashy, frantic, or distracting.

**Core Invariant:** Booking conversion is paramount. The primary Call-to-Action (CTA) and navigation controls are permanently visible, clickable, and never obstructed by WebGL or transitions.

---

## 2. Technology Stack & Primitives

| Layer | Library / Engine | Configuration File |
| :--- | :--- | :--- |
| **Smooth Scroll** | `lenis` (v1.1.14) | [`src/components/layout/SmoothScrollProvider.tsx`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/components/layout/SmoothScrollProvider.tsx) |
| **Scroll Choreography** | `gsap` (v3.12.5) + `ScrollTrigger` | Synchronized on Lenis's `scroll` event in a single RAF loop |
| **3D WebGL Canvas** | `@react-three/fiber` + `@react-three/drei` + `three` | Dynamically imported with `ssr: false` post-first paint |
| **Micro-Interactions** | `framer-motion` (v12.4.7) | Springs and hardware-accelerated transforms |
| **Device Adaptation** | Custom capability detection store | [`src/lib/useCapability.ts`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/lib/useCapability.ts) |
| **Motion Tokens** | Shared easings, durations, and staggers | [`src/lib/motion.ts`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/lib/motion.ts) |

---

## 3. Performance Tiering Matrix

Every motion component inspects `useCapability()` before initializing:

| Device Tier | Hardware Profile | 3D Canvas Behavior | DOM & Scroll Animation |
| :--- | :--- | :--- | :--- |
| **Tier 1 (`high`)** | Desktop / Laptop, >4 CPU cores, >4GB RAM, no save-data | Full instanced mesh (80 pearl globules, 30 leaves, 3 transmission glass spheres), Lightformers, mouse parallax | Lenis smooth scroll, magnetic button pull, 3D perspective tilt (8° max), pinned horizontal consultation scroll |
| **Tier 2 (`mid`)** | Mobile / Tablet or 4 CPU cores, standard memory | Simplified 3D (35 pearl globules, 12 leaves, 1 glass sphere), gyro drift | Lenis disabled on touch; standard touch scroll with spring reveal fades |
| **Tier 3 (`low` / reduced motion)** | `prefers-reduced-motion: reduce`, low memory (<4GB), or Save-Data active | **Canvas skipped completely**. High-resolution static image poster is displayed immediately. | Pure instant or subtle CSS opacity crossfades. Custom cursor and heavy tilts disabled. |

---

## 4. Section-by-Section Choreography

### 1. Brand Intro (`src/components/layout/BrandIntro.tsx`)
- Executes once per session (`sessionStorage.getItem('vshma_intro_seen')`).
- Duration: 1.25s total. Skippable by pressing ESC or clicking anywhere.
- The VSHMA half-circle brand mark splits horizontally and sweeps open as a curtain into the hero.
- **Zero LCP penalty**: The hero headline and text are in the initial DOM tree and never hidden from search crawlers or accessibility tree.

### 2. Hero 3D Scene (`src/components/3d/HeroScene.tsx`)
- Instanced mesh of homeopathic pearl globules with subtle pearly clearcoat sheen.
- Procedural bezier botanical leaves swaying with gentle rotational drift.
- Thin transmission glass spheres refracting the soft ambient lighting built from drei `Lightformers` (no external HDR downloads).
- Mouse cursor parallax: camera smoothly shifts up to 0.4 units based on pointer position.
- Scroll dissolution: as user scrolls down, camera dollys forward through the globules into the next section.

### 3. Interactive Components
- **Magnetic Pill Buttons (`PillButton.tsx`)**: Spring magnetic pull within a 50px radius on desktop workstations.
- **Sage Cards (`SageCard.tsx`)**: Subtle 3D perspective tilt up to 8° with moving specular radial highlight.
- **Consultations Pinned Horizontal Scroll (`ConsultationsSection.tsx`)**: On desktop, GSAP pins the viewport and scrubs horizontally across the 6 clinical consultation categories; on mobile, cleanly degrades to a tactile accordion.
- **Custom Cursor (`CustomCursor.tsx`)**: Lerped ring lagging smoothly behind the cursor, expanding to 64px with subtle blend mode over clickable pills and cards. Automatically hidden on touch devices.

### 4. Page & Route Transitions (`src/app/template.tsx`)
- Deep forest curtain (`#121A15`) wipes out over 650ms on route navigation with a centered gold emblem.
- Degrades instantly to standard zero-curtain rendering on low-capability devices.
- **Zero Residual Transforms**: When route transition completes, the Framer Motion wrapper is removed (`onAnimationComplete`) so ancestors of fixed/pinned sections remain 100% free of transforms.

### 5. Viewport-Fit System & Pinned Chapter Alignment
- **Dynamic `--nav-h`**: Real navbar height measured dynamically via `ResizeObserver` and applied to `:root`.
- **Screen Chapter Utility**: Every landing chapter fits inside `calc(100svh - var(--nav-h))`, ensuring the full chapter is visible at once on 1366x768, 1536x864, and 1920x1080/1009 viewports without clipping.
- **GSAP Pinned Offset**: Pinned horizontal consultations start at `top top+=${navH}`, using `pinSpacing: true`, `anticipatePin: 1`, and `invalidateOnRefresh: true`.
- **Soft Proximity Snap**: Desktop ScrollTrigger proximity snapping gently settles near chapter boundaries without fighting user scroll gestures.
- **Consolidated Floating Dock**: Replaced competing floating widgets with a single bottom-right expandable action dock (WhatsApp, Phone, Care Assistant, Booking) that coordinates with in-page buttons.

---

## 5. Maintenance & Token Configuration

To tune motion speeds and timings clinic-wide, edit [`src/lib/motion.ts`](file:///c:/Users/tmrma/Documents/Projects/Homeo/vshma/src/lib/motion.ts):
```typescript
export const MOTION_EASINGS = {
  luxury: [0.2, 0.7, 0.2, 1],
  expoOut: [0.16, 1, 0.3, 1],
  springTactile: { stiffness: 260, damping: 20 },
};
```
