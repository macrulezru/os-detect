import { platform as nodePlatform } from 'node:os';
import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    OsDetect: {
      getOS: () => string;
      detectIsWindows: () => boolean;
      detectIsMacOS: () => boolean;
      detectIsLinux: () => boolean;
      isDesktopDevice: () => boolean;
      isMobileDevice: () => boolean;
    };
  }
}

// Maps the host machine's Node platform to the OS string os-detect should
// report when running, unmocked, in a real browser on that same machine.
const HOST_OS: Record<string, string> = {
  win32: 'windows',
  darwin: 'macos',
  linux: 'linux',
};

test.describe('real host (no spoofing)', () => {
  test('getOS() matches the actual host OS', async ({ page, browserName }) => {
    // Playwright's WebKit build always identifies as macOS Safari, regardless
    // of the actual host OS — there is no native WebKit port whose UA reports
    // Windows/Linux, so the host-OS comparison doesn't apply to it.
    test.skip(browserName === 'webkit', 'Playwright WebKit always reports macOS');

    const expected = HOST_OS[nodePlatform()];
    test.skip(!expected, `no expectation mapped for host platform "${nodePlatform()}"`);

    await page.goto('/');
    const os = await page.evaluate(() => window.OsDetect.getOS());
    expect(os).toBe(expected);
  });

  test('isDesktopDevice() is true, isMobileDevice() is false', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => ({
      desktop: window.OsDetect.isDesktopDevice(),
      mobile: window.OsDetect.isMobileDevice(),
    }));
    expect(result).toEqual({ desktop: true, mobile: false });
  });
});

test.describe('userAgent-string fallback (browsers without userAgentData)', () => {
  // Chromium reports navigator.userAgentData derived from the real host platform
  // regardless of a spoofed legacy `userAgent` string, so os-detect correctly
  // prefers that truth over the spoofed UA — these scenarios only exercise the
  // UA-regex fallback path on engines that don't implement userAgentData at all.
  test.skip(({ browserName }) => browserName === 'chromium', 'chromium uses real userAgentData');

  test.use({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  test('spoofed Windows UA → detectIsWindows() true, getOS() windows', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => ({
      isWindows: window.OsDetect.detectIsWindows(),
      os: window.OsDetect.getOS(),
    }));
    expect(result).toEqual({ isWindows: true, os: 'windows' });
  });
});
