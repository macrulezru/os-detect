import { memoizeBoolean } from '../utils/cache';

// Whether the device has a touchscreen at all — independent of which input
// type (touch or mouse) is currently primary. A Windows laptop with a
// touchscreen and an attached mouse still reports true here; see
// getPrimaryInput() in index.ts for which one is actually driving input
// right now.
export const detectHasTouch = memoizeBoolean((): boolean => {
  if (typeof navigator === 'undefined') return false;

  if (typeof navigator.maxTouchPoints === 'number') return navigator.maxTouchPoints > 0;

  // Legacy IE11/old-Edge property, kept as a last-resort fallback.
  const legacyMaxTouchPoints = (navigator as Navigator & { msMaxTouchPoints?: number })
    .msMaxTouchPoints;
  if (typeof legacyMaxTouchPoints === 'number') return legacyMaxTouchPoints > 0;

  return typeof window !== 'undefined' && 'ontouchstart' in window;
});
