/**
 * Central Motion Architecture & Timing Tokens for VSHMA Clinic
 * Expresses unhurried, grounded luxury: slow, weighty, and tactile.
 */

export const EASINGS = {
  // Bespoke luxury cubic-bezier: soft start, weighty acceleration, calm glide to rest
  luxury: [0.2, 0.7, 0.2, 1] as const,
  luxuryCss: 'cubic-bezier(0.2, 0.7, 0.2, 1)',

  // Sharp exponential out: responsive interactions
  expoOut: [0.16, 1, 0.3, 1] as const,
  expoOutCss: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Gentle smooth: for continuous ambient floats and transitions
  ambient: [0.37, 0, 0.63, 1] as const,
  ambientCss: 'cubic-bezier(0.37, 0, 0.63, 1)',
} as const;

export const DURATIONS = {
  instant: 0.15,
  micro: 0.25,
  snappy: 0.45,
  standard: 0.75,
  calm: 1.1,
  cinematic: 1.6,
  heroFloat: 6.0,
} as const;

export const STAGGERS = {
  fast: 0.06,
  standard: 0.12,
  cards: 0.16,
  sections: 0.25,
} as const;

export const TRANSITIONS = {
  luxury: {
    duration: DURATIONS.standard,
    ease: EASINGS.luxury,
  },
  calmReveal: {
    duration: DURATIONS.calm,
    ease: EASINGS.luxury,
  },
  cardHover: {
    duration: DURATIONS.micro,
    ease: EASINGS.expoOut,
  },
} as const;
