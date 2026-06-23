import { getUADataPlatform, getNodePlatform } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';
import { detectIsAndroid } from './android';
import { detectIsChromeOS } from './chromeos';

// Linux (excludes Android and ChromeOS)
export const detectIsLinux = memoizeBoolean((): boolean => {
  // Node.js: process.platform === 'linux'
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) return nodePlatform === 'linux';

  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'linux';

  return /Linux/.test(navigator.userAgent) && !detectIsAndroid() && !detectIsChromeOS();
});
