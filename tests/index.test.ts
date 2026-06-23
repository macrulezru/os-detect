type OsDetectModule = typeof import('../src/index');

function mockNavigator(options: {
  userAgent?: string;
  maxTouchPoints?: number;
  userAgentData?: { platform: string; mobile: boolean } | null;
}) {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: options.userAgent ?? '',
      maxTouchPoints: options.maxTouchPoints ?? 0,
      userAgentData: options.userAgentData !== undefined ? options.userAgentData : undefined,
    },
    writable: true,
    configurable: true,
  });
}

async function load(): Promise<OsDetectModule> {
  jest.resetModules();
  return import('../src/index');
}

// ---- iOS / iPadOS ----

describe('detectIsIOS', () => {
  it('iPhone UA → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(true);
  });

  it('iPod UA → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)' });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(true);
  });

  it('iPad UA (iPadOS 12) → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)' });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(true);
  });

  it('iPadOS 13+ (Macintosh UA + maxTouchPoints=5) → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(true);
  });

  it('macOS desktop (Macintosh UA + maxTouchPoints=0) → false', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      maxTouchPoints: 0,
    });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(false);
  });

  it('Windows UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { detectIsIOS } = await load();
    expect(detectIsIOS()).toBe(false);
  });
});

// ---- macOS ----

describe('detectIsMacOS', () => {
  it('macOS Safari (Macintosh + maxTouchPoints=0) → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      maxTouchPoints: 0,
    });
    const { detectIsMacOS } = await load();
    expect(detectIsMacOS()).toBe(true);
  });

  it('iPadOS 13+ (Macintosh UA + maxTouchPoints=5) → false (not macOS)', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    const { detectIsMacOS } = await load();
    expect(detectIsMacOS()).toBe(false);
  });

  it('Windows UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { detectIsMacOS } = await load();
    expect(detectIsMacOS()).toBe(false);
  });
});

// ---- Android ----

describe('detectIsAndroid', () => {
  it('Android Chrome UA → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36' });
    const { detectIsAndroid } = await load();
    expect(detectIsAndroid()).toBe(true);
  });

  it('Linux desktop UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' });
    const { detectIsAndroid } = await load();
    expect(detectIsAndroid()).toBe(false);
  });
});

// ---- Windows ----

describe('detectIsWindows', () => {
  it('Windows 10 UA → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const { detectIsWindows } = await load();
    expect(detectIsWindows()).toBe(true);
  });

  it('macOS UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)' });
    const { detectIsWindows } = await load();
    expect(detectIsWindows()).toBe(false);
  });
});

// ---- Linux ----

describe('detectIsLinux', () => {
  it('Linux desktop UA → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' });
    const { detectIsLinux } = await load();
    expect(detectIsLinux()).toBe(true);
  });

  it('Android UA → false (Android excluded from Linux)', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36' });
    const { detectIsLinux } = await load();
    expect(detectIsLinux()).toBe(false);
  });
});

// ---- userAgentData (Chrome 90+) ----

describe('navigator.userAgentData support', () => {
  it('Windows via userAgentData → detectIsWindows=true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: { platform: 'Windows', mobile: false },
    });
    const { detectIsWindows } = await load();
    expect(detectIsWindows()).toBe(true);
  });

  it('macOS via userAgentData → detectIsMacOS=true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      userAgentData: { platform: 'macOS', mobile: false },
    });
    const { detectIsMacOS } = await load();
    expect(detectIsMacOS()).toBe(true);
  });

  it('Android via userAgentData → detectIsAndroid=true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Linux; Android 14)',
      userAgentData: { platform: 'Android', mobile: true },
    });
    const { detectIsAndroid } = await load();
    expect(detectIsAndroid()).toBe(true);
  });
});

// ---- Composite functions ----

describe('isMobileDevice', () => {
  it('iOS → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const { isMobileDevice } = await load();
    expect(isMobileDevice()).toBe(true);
  });

  it('Android → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' });
    const { isMobileDevice } = await load();
    expect(isMobileDevice()).toBe(true);
  });

  it('Windows → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { isMobileDevice } = await load();
    expect(isMobileDevice()).toBe(false);
  });
});

describe('isDesktopDevice', () => {
  it('macOS → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', maxTouchPoints: 0 });
    const { isDesktopDevice } = await load();
    expect(isDesktopDevice()).toBe(true);
  });

  it('Windows → true', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { isDesktopDevice } = await load();
    expect(isDesktopDevice()).toBe(true);
  });

  it('iOS → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const { isDesktopDevice } = await load();
    expect(isDesktopDevice()).toBe(false);
  });
});

// ---- Node.js environment (process.platform) ----

describe('Node.js environment (process.platform)', () => {
  const originalPlatform = process.platform;

  function setNodePlatform(platform: string) {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process, 'platform', {
      value: platform,
      writable: true,
      configurable: true,
    });
  }

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    mockNavigator({ userAgent: '' });
  });

  it('darwin → detectIsMacOS=true, getOS=macos', async () => {
    setNodePlatform('darwin');
    const mod = await load();
    expect(mod.detectIsMacOS()).toBe(true);
    expect(mod.getOS()).toBe('macos');
  });

  it('win32 → detectIsWindows=true, getOS=windows', async () => {
    setNodePlatform('win32');
    const mod = await load();
    expect(mod.detectIsWindows()).toBe(true);
    expect(mod.getOS()).toBe('windows');
  });

  it('linux → detectIsLinux=true, getOS=linux', async () => {
    setNodePlatform('linux');
    const mod = await load();
    expect(mod.detectIsLinux()).toBe(true);
    expect(mod.getOS()).toBe('linux');
  });

  it('android → detectIsAndroid=true, getOS=android', async () => {
    setNodePlatform('android');
    const mod = await load();
    expect(mod.detectIsAndroid()).toBe(true);
    expect(mod.getOS()).toBe('android');
  });

  it('darwin → isDesktopDevice=true, isMobileDevice=false', async () => {
    setNodePlatform('darwin');
    const mod = await load();
    expect(mod.isDesktopDevice()).toBe(true);
    expect(mod.isMobileDevice()).toBe(false);
  });

  it('detectIsIOS always false in Node.js (not detectable)', async () => {
    setNodePlatform('darwin');
    const mod = await load();
    expect(mod.detectIsIOS()).toBe(false);
  });

  it('detectIsChromeOS always false in Node.js (not detectable)', async () => {
    setNodePlatform('linux');
    const mod = await load();
    expect(mod.detectIsChromeOS()).toBe(false);
  });

  it('browser UA is ignored when navigator is absent', async () => {
    // Even if we somehow had a Windows UA string, process.platform wins
    setNodePlatform('darwin');
    const mod = await load();
    expect(mod.detectIsWindows()).toBe(false);
    expect(mod.detectIsMacOS()).toBe(true);
  });
});

// ---- Deprecated alias ----

describe('deprecated detectIsiOS', () => {
  it('returns correct value and logs warning', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { detectIsiOS } = await load();
    expect(detectIsiOS()).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'));
    warnSpy.mockRestore();
  });
});

// ---- ChromeOS ----

describe('detectIsChromeOS', () => {
  it('ChromeOS UA → true', async () => {
    mockNavigator({
      userAgent:
        'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    });
    const { detectIsChromeOS } = await load();
    expect(detectIsChromeOS()).toBe(true);
  });

  it('Linux desktop UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' });
    const { detectIsChromeOS } = await load();
    expect(detectIsChromeOS()).toBe(false);
  });

  it('ChromeOS via userAgentData → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)',
      userAgentData: { platform: 'Chrome OS', mobile: false },
    });
    const { detectIsChromeOS } = await load();
    expect(detectIsChromeOS()).toBe(true);
  });
});

// ---- Linux excludes ChromeOS ----

describe('detectIsLinux excludes ChromeOS', () => {
  it('ChromeOS UA → detectIsLinux=false', async () => {
    mockNavigator({
      userAgent:
        'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36',
    });
    const { detectIsLinux } = await load();
    expect(detectIsLinux()).toBe(false);
  });
});

// ---- getOS ----

describe('getOS', () => {
  it('iPhone → ios', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    const { getOS } = await load();
    expect(getOS()).toBe('ios');
  });

  it('Android → android', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' });
    const { getOS } = await load();
    expect(getOS()).toBe('android');
  });

  it('ChromeOS → chromeos', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36',
    });
    const { getOS } = await load();
    expect(getOS()).toBe('chromeos');
  });

  it('Linux → linux', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' });
    const { getOS } = await load();
    expect(getOS()).toBe('linux');
  });

  it('macOS → macos', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      maxTouchPoints: 0,
    });
    const { getOS } = await load();
    expect(getOS()).toBe('macos');
  });

  it('Windows → windows', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { getOS } = await load();
    expect(getOS()).toBe('windows');
  });

  it('unknown UA → unknown', async () => {
    mockNavigator({ userAgent: 'UnknownBrowser/1.0' });
    const { getOS } = await load();
    expect(getOS()).toBe('unknown');
  });
});

// ---- resetDetectionCache ----

describe('resetDetectionCache', () => {
  it('forces re-detection after the navigator changes', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const { detectIsWindows, detectIsMacOS, resetDetectionCache } = await load();
    expect(detectIsWindows()).toBe(true);
    expect(detectIsMacOS()).toBe(false);

    mockNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', maxTouchPoints: 0 });

    // Stale cache: still reports the old result.
    expect(detectIsWindows()).toBe(true);

    resetDetectionCache();

    expect(detectIsWindows()).toBe(false);
    expect(detectIsMacOS()).toBe(true);
  });
});

// ---- detectIsWindows11 ----

describe('detectIsWindows11', () => {
  it('Windows 11 (platformVersion 13.0.0) → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: {
        platform: 'Windows',
        mobile: false,
        getHighEntropyValues: async () => ({ platformVersion: '13.0.0' }),
      } as any,
    });
    const { detectIsWindows11 } = await load();
    await expect(detectIsWindows11()).resolves.toBe(true);
  });

  it('Windows 10 (platformVersion 10.0.0) → false', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: {
        platform: 'Windows',
        mobile: false,
        getHighEntropyValues: async () => ({ platformVersion: '10.0.0' }),
      } as any,
    });
    const { detectIsWindows11 } = await load();
    await expect(detectIsWindows11()).resolves.toBe(false);
  });

  it('non-Windows → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)' });
    const { detectIsWindows11 } = await load();
    await expect(detectIsWindows11()).resolves.toBe(false);
  });

  it('no userAgentData → false', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: null,
    });
    const { detectIsWindows11 } = await load();
    await expect(detectIsWindows11()).resolves.toBe(false);
  });
});
