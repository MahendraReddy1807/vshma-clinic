'use client';

import { useSyncExternalStore } from 'react';

export type CapabilityTier = 'high' | 'mid' | 'low';

export interface DeviceCapability {
  tier: CapabilityTier;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  isSaveData: boolean;
  isMobile: boolean;
}

const SERVER_CAPABILITY: DeviceCapability = {
  tier: 'mid',
  isTouch: false,
  prefersReducedMotion: false,
  hardwareConcurrency: 4,
  deviceMemory: 4,
  isSaveData: false,
  isMobile: false,
};

let cachedCapability: DeviceCapability | null = null;

function computeCapability(): DeviceCapability {
  if (typeof window === 'undefined') return SERVER_CAPABILITY;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = Boolean(
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints
  );

  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const navWithMem = navigator as unknown as { deviceMemory?: number; connection?: { saveData?: boolean } };
  const deviceMemory = navWithMem.deviceMemory || null;
  const isSaveData = Boolean(navWithMem.connection?.saveData);
  const isMobile = window.innerWidth < 768;

  let tier: CapabilityTier = 'high';
  if (prefersReducedMotion || isSaveData || hardwareConcurrency < 4 || (deviceMemory !== null && deviceMemory < 4)) {
    tier = 'low';
  } else if (isMobile || hardwareConcurrency < 8 || (deviceMemory !== null && deviceMemory < 8)) {
    tier = 'mid';
  } else {
    tier = 'high';
  }

  return {
    tier,
    isTouch,
    prefersReducedMotion,
    hardwareConcurrency,
    deviceMemory,
    isSaveData,
    isMobile,
  };
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = () => {
    cachedCapability = computeCapability();
    callback();
  };

  mql.addEventListener('change', handler);
  window.addEventListener('resize', handler);

  return () => {
    mql.removeEventListener('change', handler);
    window.removeEventListener('resize', handler);
  };
}

function getSnapshot(): DeviceCapability {
  if (!cachedCapability) {
    cachedCapability = computeCapability();
  }
  return cachedCapability;
}

function getServerSnapshot(): DeviceCapability {
  return SERVER_CAPABILITY;
}

export function useCapability(): DeviceCapability {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
