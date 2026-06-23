import { getUADataPlatform, getNodePlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';
import { detectIsIOS } from './ios';

// macOS (desktop, not iPadOS)
export const detectIsMacOS = memoizeBoolean((): boolean => {
  // Node.js: process.platform === 'darwin'
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) return nodePlatform === 'darwin';

  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'macos';

  // Fallback: userAgent; exclude iPadOS 13+ which sends Macintosh in UA
  const isMacUA = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
  return isMacUA && !detectIsIOS();
});
