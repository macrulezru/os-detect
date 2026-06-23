export { detectIsIOS } from './detectors/ios';
export { detectIsMacOS } from './detectors/macos';
export { detectIsAndroid } from './detectors/android';
export { detectIsChromeOS } from './detectors/chromeos';
export { detectIsLinux } from './detectors/linux';
export { detectIsWindows, detectIsWindows11 } from './detectors/windows';
export { resetDetectionCache } from './utils/cache';

import { detectIsIOS } from './detectors/ios';
import { detectIsMacOS } from './detectors/macos';
import { detectIsAndroid } from './detectors/android';
import { detectIsChromeOS } from './detectors/chromeos';
import { detectIsLinux } from './detectors/linux';
import { detectIsWindows, detectIsWindows11 } from './detectors/windows';
import { resetDetectionCache } from './utils/cache';

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

// ---- Deprecated alias for backwards compatibility ----
/** @deprecated Use detectIsIOS() instead. Will be removed in v3.0. */
export function detectIsiOS(): boolean {
  if (typeof console !== 'undefined') {
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
  detectIsiOS,
  resetDetectionCache,
};

export default osDetect;
