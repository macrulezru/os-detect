// Types for navigator.userAgentData (Chrome 90+, experimental API)
export interface NavigatorUAData {
  platform: string;
  mobile: boolean;
  brands: Array<{ brand: string; version: string }>;
  getHighEntropyValues: (hints: string[]) => Promise<{ platformVersion?: string }>;
}

// Get platform from userAgentData if available.
export function getUADataPlatform(): string | null {
  if (typeof navigator === 'undefined') return null;
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  if (uaData && typeof uaData.platform === 'string') {
    return uaData.platform.toLowerCase();
  }
  return null;
}

// Get platform from Node.js process if available.
// Returns process.platform only when navigator is absent (non-browser environment).
// Values: 'darwin' (macOS), 'win32' (Windows), 'linux', 'android', etc.
export function getNodePlatform(): string | null {
  if (typeof navigator !== 'undefined') return null;
  if (typeof process === 'undefined' || typeof process.platform !== 'string') return null;
  return process.platform;
}
