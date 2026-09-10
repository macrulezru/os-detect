export {};

type OsDetectModule = typeof import('../src/index');

function mockNavigator(options: { userAgent?: string; standalone?: boolean }) {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: options.userAgent ?? '',
      ...(options.standalone !== undefined ? { standalone: options.standalone } : {}),
    },
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

function noMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

function mockReferrer(referrer: string) {
  Object.defineProperty(document, 'referrer', {
    value: referrer,
    configurable: true,
  });
}

async function load(): Promise<OsDetectModule> {
  jest.resetModules();
  return import('../src/index');
}

const originalVersions = process.versions;

function setProcessVersions(versions: Record<string, string | undefined> | undefined) {
  Object.defineProperty(process, 'versions', {
    value: versions,
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  setProcessVersions(originalVersions);
  mockNavigator({ userAgent: '' });
  noMatchMedia();
  mockReferrer('');
});

// ---- detectIsNode ----
// Real Jest always runs on Node.js, so process.versions.node is genuinely
// present unless stubbed away — the "true" case here IS the real signal,
// not a simulation.

describe('detectIsNode', () => {
  it('process.versions.node present → true', async () => {
    const { detectIsNode } = await load();
    expect(detectIsNode()).toBe(true);
  });

  it('process.versions without node → false', async () => {
    setProcessVersions({});
    const { detectIsNode } = await load();
    expect(detectIsNode()).toBe(false);
  });

  it('process.versions undefined → false', async () => {
    setProcessVersions(undefined);
    const { detectIsNode } = await load();
    expect(detectIsNode()).toBe(false);
  });
});

// ---- detectIsBrowser ----
// jsdom always provides window+document, so only the "true" branch is
// reachable here — see tests/runtime-node-env.test.ts for the false case.

describe('detectIsBrowser', () => {
  it('window + document present (jsdom) → true', async () => {
    const { detectIsBrowser } = await load();
    expect(detectIsBrowser()).toBe(true);
  });
});

// ---- detectIsWebWorker ----
// jsdom always provides window, so only the "not a worker" branch is
// reachable here — see tests/runtime-node-env.test.ts for a simulated
// worker context (self + importScripts, no window).

describe('detectIsWebWorker', () => {
  it('window present (jsdom, not a worker) → false', async () => {
    const { detectIsWebWorker } = await load();
    expect(detectIsWebWorker()).toBe(false);
  });
});

// ---- detectIsElectron ----

describe('detectIsElectron', () => {
  it('process.versions.electron present → true', async () => {
    setProcessVersions({ ...originalVersions, electron: '30.0.0' });
    const { detectIsElectron } = await load();
    expect(detectIsElectron()).toBe(true);
  });

  it('Electron token in userAgent (contextIsolated renderer, no process) → true', async () => {
    setProcessVersions({});
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Electron/30.0.0',
    });
    const { detectIsElectron } = await load();
    expect(detectIsElectron()).toBe(true);
  });

  it('plain browser, no Electron signal → false', async () => {
    setProcessVersions({});
    mockNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const { detectIsElectron } = await load();
    expect(detectIsElectron()).toBe(false);
  });
});

// ---- detectIsPWA ----

describe('detectIsPWA', () => {
  it('display-mode: standalone matches → true', async () => {
    mockMatchMedia((query) => query === '(display-mode: standalone)');
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(true);
  });

  it('display-mode: window-controls-overlay matches → true', async () => {
    mockMatchMedia((query) => query === '(display-mode: window-controls-overlay)');
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(true);
  });

  it('iOS Safari navigator.standalone → true', async () => {
    noMatchMedia();
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      standalone: true,
    });
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(true);
  });

  it('Trusted Web Activity referrer → true', async () => {
    noMatchMedia();
    mockReferrer('android-app://com.example.twa');
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(true);
  });

  it('plain browser tab → false', async () => {
    mockMatchMedia(() => false);
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(false);
  });
});

// ---- getRuntime ----

describe('getRuntime', () => {
  it('jsdom (window present) → browser', async () => {
    const { getRuntime } = await load();
    expect(getRuntime()).toBe('browser');
  });
});
