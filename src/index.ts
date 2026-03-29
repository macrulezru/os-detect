// Types for navigator.userAgentData (Chrome 90+, experimental API)
interface NavigatorUAData {
  platform: string;
  mobile: boolean;
  brands: Array<{ brand: string; version: string }>;
  getHighEntropyValues: (hints: string[]) => Promise<{ platformVersion?: string }>;
}

// ---- Cache ----
let cachedIsIOS: boolean | undefined;
let cachedIsMacOS: boolean | undefined;
let cachedIsAndroid: boolean | undefined;
let cachedIsWindows: boolean | undefined;
let cachedIsLinux: boolean | undefined;
let cachedIsChromeOS: boolean | undefined;

// ---- Helper: get platform from userAgentData if available ----
function getUADataPlatform(): string | null {
  if (typeof navigator === 'undefined') return null;
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  if (uaData && typeof uaData.platform === 'string') {
    return uaData.platform.toLowerCase();
  }
  return null;
}

// ---- Helper: get platform from Node.js process if available ----
// Returns process.platform only when navigator is absent (non-browser environment).
// Values: 'darwin' (macOS), 'win32' (Windows), 'linux', 'android', etc.
function getNodePlatform(): string | null {
  if (typeof navigator !== 'undefined') return null;
  if (typeof process === 'undefined' || typeof process.platform !== 'string') return null;
  return process.platform;
}

// ---- iOS / iPadOS ----
// Not detectable in Node.js — returns false outside browser context.
export function detectIsIOS(): boolean {
  if (typeof cachedIsIOS === 'boolean') return cachedIsIOS;
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return (cachedIsIOS = false);
  }

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsIOS = platform === 'ios';
    return cachedIsIOS;
  }

  // iPhone / iPod via UA
  const isClassicIOSUA = /iPhone|iPod/.test(navigator.userAgent);

  // iPad with explicit UA (iPadOS 12 and older)
  const isIPadUA = /iPad/.test(navigator.userAgent);

  // iPadOS 13+ disguises itself as macOS — detect via maxTouchPoints
  const isIPadOS =
    /Macintosh/.test(navigator.userAgent) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1;

  cachedIsIOS = isClassicIOSUA || isIPadUA || isIPadOS;
  return cachedIsIOS;
}

// ---- macOS (desktop, not iPadOS) ----
export function detectIsMacOS(): boolean {
  if (typeof cachedIsMacOS === 'boolean') return cachedIsMacOS;

  // Node.js: process.platform === 'darwin'
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) {
    return (cachedIsMacOS = nodePlatform === 'darwin');
  }

  if (typeof navigator === 'undefined') return (cachedIsMacOS = false);

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsMacOS = platform === 'macos';
    return cachedIsMacOS;
  }

  // Fallback: userAgent; exclude iPadOS 13+ which sends Macintosh in UA
  const isMacUA = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
  cachedIsMacOS = isMacUA && !detectIsIOS();
  return cachedIsMacOS;
}

// ---- Android ----
export function detectIsAndroid(): boolean {
  if (typeof cachedIsAndroid === 'boolean') return cachedIsAndroid;

  // Node.js: process.platform === 'android' (React Native / custom Node builds)
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) {
    return (cachedIsAndroid = nodePlatform === 'android');
  }

  if (typeof navigator === 'undefined') return (cachedIsAndroid = false);

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsAndroid = platform === 'android';
    return cachedIsAndroid;
  }

  cachedIsAndroid = /Android/.test(navigator.userAgent);
  return cachedIsAndroid;
}

// ---- Windows ----
export function detectIsWindows(): boolean {
  if (typeof cachedIsWindows === 'boolean') return cachedIsWindows;

  // Node.js: process.platform === 'win32' (both 32-bit and 64-bit Windows)
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) {
    return (cachedIsWindows = nodePlatform === 'win32');
  }

  if (typeof navigator === 'undefined') return (cachedIsWindows = false);

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsWindows = platform === 'windows';
    return cachedIsWindows;
  }

  cachedIsWindows = /Win32|Win64|Windows|WinCE/.test(navigator.userAgent);
  return cachedIsWindows;
}

// ---- ChromeOS ----
// Not detectable in Node.js — returns false outside browser context.
export function detectIsChromeOS(): boolean {
  if (typeof cachedIsChromeOS === 'boolean') return cachedIsChromeOS;
  if (typeof navigator === 'undefined') return (cachedIsChromeOS = false);

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsChromeOS = platform === 'chrome os' || platform === 'chromeos';
    return cachedIsChromeOS;
  }

  cachedIsChromeOS = /CrOS/.test(navigator.userAgent);
  return cachedIsChromeOS;
}

// ---- Linux (excludes Android and ChromeOS) ----
export function detectIsLinux(): boolean {
  if (typeof cachedIsLinux === 'boolean') return cachedIsLinux;

  // Node.js: process.platform === 'linux'
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) {
    return (cachedIsLinux = nodePlatform === 'linux');
  }

  if (typeof navigator === 'undefined') return (cachedIsLinux = false);

  const platform = getUADataPlatform();
  if (platform !== null) {
    cachedIsLinux = platform === 'linux';
    return cachedIsLinux;
  }

  cachedIsLinux =
    /Linux/.test(navigator.userAgent) && !detectIsAndroid() && !detectIsChromeOS();
  return cachedIsLinux;
}

// ---- Windows 11 ----
// Browser: uses userAgentData.getHighEntropyValues() (Chrome 90+ / Edge 90+).
// Node.js: uses os.release() — Windows 11 reports build number >= 22000.
// Returns false if not Windows, if the API is unavailable, or if detection fails.
export async function detectIsWindows11(): Promise<boolean> {
  if (!detectIsWindows()) return false;

  // Node.js path
  if (typeof navigator === 'undefined' && typeof process !== 'undefined') {
    try {
      const { release } = await import('os');
      const buildNumber = parseInt(release().split('.')[2] ?? '0', 10);
      return buildNumber >= 22000;
    } catch {
      return false;
    }
  }

  // Browser path: userAgentData high-entropy values
  try {
    const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
    if (!nav.userAgentData?.getHighEntropyValues) return false;

    const { platformVersion } = await nav.userAgentData.getHighEntropyValues([
      'platformVersion',
    ]);
    if (!platformVersion) return false;

    // Windows 11 reports platformVersion >= 13.0.0
    const majorVersion = parseInt(platformVersion.split('.')[0], 10);
    return majorVersion >= 13;
  } catch {
    return false;
  }
}

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
};

export default osDetect;
