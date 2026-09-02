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

// Node.js 21+ exposes a bare global `navigator` (part of the fetch-API globals)
// whose userAgent is always exactly "Node.js/<major>" — distinct from any real
// browser or jsdom navigator, which always report a real product/version string.
// Detecting this lets getNodePlatform() keep working on modern Node instead of
// permanently short-circuiting on `typeof navigator !== 'undefined'`.
export function isNodeNavigator(nav: unknown): boolean {
  return (
    typeof nav === 'object' &&
    nav !== null &&
    typeof (nav as { userAgent?: unknown }).userAgent === 'string' &&
    /^Node\.js\//.test((nav as { userAgent: string }).userAgent)
  );
}

// Get platform from Node.js process if available.
// Returns process.platform only when navigator is absent, or is Node's own
// synthetic navigator (Node.js 21+) rather than a real browser navigator.
// Values: 'darwin' (macOS), 'win32' (Windows), 'linux', 'android', etc.
export function getNodePlatform(): string | null {
  if (typeof navigator !== 'undefined' && !isNodeNavigator(navigator)) return null;
  if (typeof process === 'undefined' || typeof process.platform !== 'string') return null;
  return process.platform;
}
