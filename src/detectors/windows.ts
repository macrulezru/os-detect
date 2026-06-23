import { getUADataPlatform, getNodePlatform, type NavigatorUAData } from '../utils/platform';
import { memoizeBoolean } from '../utils/cache';

export const detectIsWindows = memoizeBoolean((): boolean => {
  // Node.js: process.platform === 'win32' (both 32-bit and 64-bit Windows)
  const nodePlatform = getNodePlatform();
  if (nodePlatform !== null) return nodePlatform === 'win32';

  if (typeof navigator === 'undefined') return false;

  const platform = getUADataPlatform();
  if (platform !== null) return platform === 'windows';

  return /Win32|Win64|Windows|WinCE/.test(navigator.userAgent);
});

// Windows reports build numbers starting at 22000 as Windows 11 (vs. 19041-19045
// for Windows 10's last feature updates). Source: Microsoft's official Windows 11
// system requirements / build numbering docs as of Windows 11 23H2.
const WINDOWS_11_MIN_BUILD_NUMBER = 22000;

// navigator.userAgentData.getHighEntropyValues(['platformVersion']) reports a
// Windows-version-derived "platform version" rather than the real build number.
// Windows 11 is the first release to report a major version of 13+ here; Windows
// 10 reports 0-10. Source: Chromium's user-agent reduction design doc for
// Sec-CH-UA-Platform-Version.
const WINDOWS_11_MIN_PLATFORM_VERSION_MAJOR = 13;

// Windows 11.
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
      return buildNumber >= WINDOWS_11_MIN_BUILD_NUMBER;
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

    const majorVersion = parseInt(platformVersion.split('.')[0], 10);
    return majorVersion >= WINDOWS_11_MIN_PLATFORM_VERSION_MAJOR;
  } catch {
    return false;
  }
}
