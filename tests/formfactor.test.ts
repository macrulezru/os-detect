export {};

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

function mockScreen(width: number, height: number) {
  Object.defineProperty(window, 'screen', {
    value: { width, height },
    writable: true,
    configurable: true,
  });
}

function mockMatchMedia(matches: (query: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: matches(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    writable: true,
    configurable: true,
  });
}

async function load(): Promise<OsDetectModule> {
  jest.resetModules();
  return import('../src/index');
}

// ---- detectHasTouch ----

describe('detectHasTouch', () => {
  it('maxTouchPoints > 0 → true', async () => {
    mockNavigator({ userAgent: '', maxTouchPoints: 5 });
    const { detectHasTouch } = await load();
    expect(detectHasTouch()).toBe(true);
  });

  it('maxTouchPoints === 0 → false', async () => {
    mockNavigator({ userAgent: '', maxTouchPoints: 0 });
    const { detectHasTouch } = await load();
    expect(detectHasTouch()).toBe(false);
  });

  it('legacy msMaxTouchPoints > 0 → true (maxTouchPoints absent)', async () => {
    mockNavigator({ userAgent: '' });
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: '', msMaxTouchPoints: 3 },
      writable: true,
      configurable: true,
    });
    const { detectHasTouch } = await load();
    expect(detectHasTouch()).toBe(true);
  });

  it('ontouchstart fallback → true (no maxTouchPoints/msMaxTouchPoints at all)', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: '' },
      writable: true,
      configurable: true,
    });
    (window as unknown as { ontouchstart?: unknown }).ontouchstart = null;
    const { detectHasTouch } = await load();
    expect(detectHasTouch()).toBe(true);
    delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
  });

  it('navigator undefined → false', async () => {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { detectHasTouch } = await load();
    expect(detectHasTouch()).toBe(false);
    mockNavigator({ userAgent: '' });
  });
});

// ---- detectIsTV ----

describe('detectIsTV', () => {
  it('Tizen Samsung Smart TV UA → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko)',
    });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(true);
  });

  it('LG webOS UA → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko)',
    });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(true);
  });

  it('Fire TV UA → true', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Linux; Android 9; AFTMM) AppleWebKit/537.36',
    });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(true);
  });

  it('via userAgentData platform "tv" → true', async () => {
    mockNavigator({ userAgent: '', userAgentData: { platform: 'tv', mobile: false } });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(true);
  });

  it('regular desktop UA → false', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(false);
  });

  it('navigator undefined → false', async () => {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { detectIsTV } = await load();
    expect(detectIsTV()).toBe(false);
    mockNavigator({ userAgent: '' });
  });
});

// ---- getFormFactor ----

describe('getFormFactor', () => {
  it('Smart TV UA → tv', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0)' });
    mockScreen(1920, 1080);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('tv');
  });

  it('Android phone (small screen) → phone', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36' });
    mockScreen(412, 915);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('phone');
  });

  it('Android tablet (large screen) → tablet', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36' });
    mockScreen(800, 1280);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('tablet');
  });

  it('iPhone (small screen) → phone', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
    mockScreen(390, 844);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('phone');
  });

  it('iPad (large screen) → tablet', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' });
    mockScreen(1024, 1366);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('tablet');
  });

  it('mobile OS with no screen global → unknown', async () => {
    mockNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' });
    Object.defineProperty(window, 'screen', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('unknown');
    mockScreen(1024, 768);
  });

  it('Windows desktop (even with a touchscreen) → desktop', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      maxTouchPoints: 10,
    });
    mockScreen(1920, 1080);
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('desktop');
  });

  it('macOS → desktop', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      maxTouchPoints: 0,
    });
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('desktop');
  });

  it('unrecognized UA → unknown', async () => {
    mockNavigator({ userAgent: 'UnknownBrowser/1.0' });
    const { getFormFactor } = await load();
    expect(getFormFactor()).toBe('unknown');
  });
});

// ---- getPrimaryInput ----

describe('getPrimaryInput', () => {
  it('pointer: fine matches → mouse', async () => {
    mockMatchMedia((query) => query === '(pointer: fine)');
    const { getPrimaryInput } = await load();
    expect(getPrimaryInput()).toBe('mouse');
  });

  it('pointer: coarse matches → touch', async () => {
    mockMatchMedia((query) => query === '(pointer: coarse)');
    const { getPrimaryInput } = await load();
    expect(getPrimaryInput()).toBe('touch');
  });

  it('neither matches → unknown', async () => {
    mockMatchMedia(() => false);
    const { getPrimaryInput } = await load();
    expect(getPrimaryInput()).toBe('unknown');
  });

  it('no matchMedia support → unknown', async () => {
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { getPrimaryInput } = await load();
    expect(getPrimaryInput()).toBe('unknown');
  });
});

// ---- getPixelRatio ----

describe('getPixelRatio', () => {
  it('reads window.devicePixelRatio when present', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true,
      configurable: true,
    });
    const { getPixelRatio } = await load();
    expect(getPixelRatio()).toBe(2);
  });

  it('falls back to 1 when devicePixelRatio is not a number', async () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { getPixelRatio } = await load();
    expect(getPixelRatio()).toBe(1);
  });
});
