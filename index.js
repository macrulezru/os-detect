let cachedIsiOS;
let cachedIsMacOS;
let cachedIsAndroid;
let cachedIsWindows;
let cachedIsLinux;

function detectIsiOS() {
  if (typeof cachedIsiOS === 'boolean') return cachedIsiOS;
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const isIOSUA =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    typeof window.MSStream === 'undefined';
  const hasMultiTouch =
    'ontouchstart' in window ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  cachedIsiOS = Boolean(isIOSUA && hasMultiTouch);
  return cachedIsiOS;
}

function detectIsMacOS() {
  if (typeof cachedIsMacOS === 'boolean') return cachedIsMacOS;
  if (typeof navigator === 'undefined') return false;
  cachedIsMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
  return cachedIsMacOS;
}

function detectIsAndroid() {
  if (typeof cachedIsAndroid === 'boolean') return cachedIsAndroid;
  if (typeof navigator === 'undefined') return false;
  cachedIsAndroid = /Android/.test(navigator.userAgent);
  return cachedIsAndroid;
}

function detectIsWindows() {
  if (typeof cachedIsWindows === 'boolean') return cachedIsWindows;
  if (typeof navigator === 'undefined') return false;
  cachedIsWindows = /Win32|Win64|Windows|WinCE/.test(navigator.userAgent);
  return cachedIsWindows;
}

function detectIsLinux() {
  if (typeof cachedIsLinux === 'boolean') return cachedIsLinux;
  if (typeof navigator === 'undefined') return false;
  cachedIsLinux = /Linux/.test(navigator.userAgent) && !detectIsAndroid();
  return cachedIsLinux;
}

function isMobileDevice() {
  return detectIsiOS() || detectIsAndroid();
}

function isDesktopDevice() {
  return detectIsMacOS() || detectIsWindows() || detectIsLinux();
}

module.exports = {
  detectIsiOS,
  detectIsMacOS,
  detectIsAndroid,
  detectIsWindows,
  detectIsLinux,
  isMobileDevice,
  isDesktopDevice
};
