import { getUADataPlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';

// ChromeOS. Not detectable in Node.js — returns false outside browser context.
export const detectIsChromeOS = memoizeBoolean((): boolean => {
  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'chrome os' || platform === 'chromeos';

  return /CrOS/.test(navigator.userAgent);
});
