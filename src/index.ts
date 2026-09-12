export { detectIsIOS } from './detectors/ios';
export { detectIsMacOS } from './detectors/macos';
export { detectIsAndroid } from './detectors/android';
export { detectIsChromeOS } from './detectors/chromeos';
export { detectIsLinux } from './detectors/linux';
export { detectIsWindows, detectIsWindows11 } from './detectors/windows';
export { detectHasTouch } from './detectors/touch';
export { detectIsTV } from './detectors/tv';
export { detectIsNode } from './detectors/node';
export { detectIsBrowser } from './detectors/browser';
export { detectIsWebWorker } from './detectors/webworker';
export { detectIsElectron } from './detectors/electron';
export { detectIsPWA } from './detectors/pwa';
export { resetDetectionCache } from './utils/cache';

import { detectIsIOS } from './detectors/ios';
import { detectIsMacOS } from './detectors/macos';
import { detectIsAndroid } from './detectors/android';
import { detectIsChromeOS } from './detectors/chromeos';
import { detectIsLinux } from './detectors/linux';
import { detectIsWindows, detectIsWindows11 } from './detectors/windows';
import { detectHasTouch } from './detectors/touch';
import { detectIsTV } from './detectors/tv';
import { detectIsNode } from './detectors/node';
import { detectIsBrowser } from './detectors/browser';
import { detectIsWebWorker } from './detectors/webworker';
import { detectIsElectron } from './detectors/electron';
import { detectIsPWA } from './detectors/pwa';
import { resetDetectionCache, registerResetter } from './utils/cache';

// ---- OS string identifier ----
export type OS = 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'chromeos' | 'unknown';

// Returns a string identifier for the current OS.
// ChromeOS is checked before Linux because ChromeOS userAgent contains "Linux".
export function getOS(): OS {
  if (detectIsIOS()) return 'ios';
  if (detectIsAndroid()) return 'android';
  if (detectIsChromeOS()) return 'chromeos';
  if (detectIsLinux()) return 'linux';
  if (detectIsMacOS()) return 'macos';
  if (detectIsWindows()) return 'windows';
  return 'unknown';
}

// ---- Composite functions ----
// NOTE: isMobileDevice() and isDesktopDevice() are NOT mutually exclusive.
// A device with an unrecognized OS will return false for both.

export function isMobileDevice(): boolean {
  return detectIsIOS() || detectIsAndroid();
}

export function isDesktopDevice(): boolean {
  return detectIsMacOS() || detectIsWindows() || detectIsLinux() || detectIsChromeOS();
}

// ---- Form factor ----

export type FormFactor = 'phone' | 'tablet' | 'desktop' | 'tv' | 'unknown';

// iPad's portrait width (and the classic Bootstrap/Tailwind tablet
// breakpoint) — the standard line drawn between "phone" and "tablet"
// screen dimensions industry-wide.
const TABLET_MIN_WIDTH = 768;

// Returns a typed string identifier for the device's form factor. Driven by
// OS + physical screen size, not by touch capability — a touchscreen
// Windows laptop is still 'desktop', not 'tablet'. 'unknown' in Node.js/SSR
// (no screen to measure) and for any OS this package doesn't recognize.
export function getFormFactor(): FormFactor {
  if (detectIsTV()) return 'tv';

  if (detectIsIOS() || detectIsAndroid()) {
    if (typeof screen === 'undefined') return 'unknown';
    const minDimension = Math.min(screen.width, screen.height);
    return minDimension >= TABLET_MIN_WIDTH ? 'tablet' : 'phone';
  }

  if (detectIsMacOS() || detectIsWindows() || detectIsLinux() || detectIsChromeOS()) {
    return 'desktop';
  }

  return 'unknown';
}

// ---- Runtime context ----

export type Runtime = 'node' | 'browser' | 'webworker' | 'unknown';

// Returns a typed string identifier for the current JS runtime context.
// Checked in this order because a browser-like `window` and a Node.js
// `process` can legitimately coexist (an Electron/NW.js renderer with Node
// integration enabled) — 'browser' wins there, since that's the context
// the code actually renders into; use detectIsElectron() to tell them apart
// from a plain browser tab.
export function getRuntime(): Runtime {
  if (detectIsWebWorker()) return 'webworker';
  if (detectIsBrowser()) return 'browser';
  if (detectIsNode()) return 'node';
  return 'unknown';
}

export type PrimaryInput = 'mouse' | 'touch' | 'unknown';

// Which input type is currently primary, via the `pointer` media feature —
// can change during a session on hybrid devices (e.g. a Surface Pro's
// keyboard/mouse being attached or detached). Deliberately NOT cached like
// the detectors above: unlike OS or form factor, this one is expected to
// change. Use usePrimaryInput() from os-detect/vue or os-detect/react to
// react to that live instead of polling this directly.
export function getPrimaryInput(): PrimaryInput {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'unknown';

  if (window.matchMedia('(pointer: fine)').matches) return 'mouse';
  if (window.matchMedia('(pointer: coarse)').matches) return 'touch';
  return 'unknown';
}

// Ratio of physical to logical pixels. Not cached, since it's cheap to read
// live and can change on desktop when a window is dragged between monitors
// with different display scaling. Falls back to 1 in Node.js/SSR.
export function getPixelRatio(): number {
  return typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number'
    ? window.devicePixelRatio
    : 1;
}

// ---- Deprecated alias for backwards compatibility ----
// The underlying detection result is cached via detectIsIOS() itself, but the
// deprecation warning isn't tied to that cache — without its own flag it would
// fire on every single call, unlike every other console.warn in this package.
let hasWarnedDeprecatedIsiOS = false;
registerResetter(() => {
  hasWarnedDeprecatedIsiOS = false;
});

/** @deprecated Use detectIsIOS() instead. Will be removed in v3.0. */
export function detectIsiOS(): boolean {
  if (!hasWarnedDeprecatedIsiOS && typeof console !== 'undefined') {
    hasWarnedDeprecatedIsiOS = true;
    console.warn(
      '[os-detect] detectIsiOS() is deprecated. Use detectIsIOS() instead. Will be removed in v3.0.'
    );
  }
  return detectIsIOS();
}

// ---- Default export for UMD and convenient CJS require ----
const osDetect = {
  detectIsIOS,
  detectIsMacOS,
  detectIsAndroid,
  detectIsWindows,
  detectIsLinux,
  detectIsChromeOS,
  detectIsWindows11,
  getOS,
  isMobileDevice,
  isDesktopDevice,
  detectHasTouch,
  detectIsTV,
  getFormFactor,
  detectIsNode,
  detectIsBrowser,
  detectIsWebWorker,
  detectIsElectron,
  detectIsPWA,
  getRuntime,
  getPrimaryInput,
  getPixelRatio,
  detectIsiOS,
  resetDetectionCache,
};

export default osDetect;
