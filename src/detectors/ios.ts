import { getUADataPlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';

// iOS / iPadOS. Not detectable in Node.js — returns false outside browser context.
export const detectIsIOS = memoizeBoolean((): boolean => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'ios';

  // iPhone / iPod via UA
  const isClassicIOSUA = /iPhone|iPod/.test(navigator.userAgent);

  // iPad with explicit UA (iPadOS 12 and older)
  const isIPadUA = /iPad/.test(navigator.userAgent);

  // iPadOS 13+ disguises itself as macOS — detect via maxTouchPoints
  const isIPadOS =
    /Macintosh/.test(navigator.userAgent) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1;

  return isClassicIOSUA || isIPadUA || isIPadOS;
});
