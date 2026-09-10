import { memoizeBoolean } from '../utils/cache';

// An installed PWA running in its own standalone window, not just a page
// open in a regular browser tab.
export const detectIsPWA = memoizeBoolean((): boolean => {
  if (typeof window === 'undefined') return false;

  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
  }

  // iOS Safari's legacy, non-standard flag for "added to Home Screen".
  if (typeof navigator !== 'undefined') {
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
    if (iosStandalone === true) return true;
  }

  // Trusted Web Activity — an installed PWA wrapped for the Play Store.
  if (typeof document !== 'undefined' && document.referrer.startsWith('android-app://')) {
    return true;
  }

  return false;
});
