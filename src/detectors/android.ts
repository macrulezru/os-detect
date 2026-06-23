import { getUADataPlatform, getNodePlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';

export const detectIsAndroid = memoizeBoolean((): boolean => {
  // Node.js: process.platform === 'android' (React Native / custom Node builds)
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) return nodePlatform === 'android';

  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'android';

  return /Android/.test(navigator.userAgent);
});
