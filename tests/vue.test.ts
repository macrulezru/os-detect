export {};

function mockNavigator(options: {
  userAgent?: string;
  userAgentData?: {
    platform: string;
    mobile: boolean;
    getHighEntropyValues: () => Promise<{ platformVersion: string }>;
  } | null;
}) {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: options.userAgent ?? '',
      userAgentData: options.userAgentData !== undefined ? options.userAgentData : undefined,
    },
    writable: true,
    configurable: true,
  });
}

async function load() {
  jest.resetModules();
  return import('../src/vue');
}

describe('useIsWindows11 (vue)', () => {
  it('does not write to the ref if the component unmounts before detection resolves', async () => {
    // Regression: detectIsWindows11().then(...) had no unmount guard —
    // resolving after unmount would still assign isWin11.value on a ref no
    // component is reading anymore.
    let resolveDetection: (v: { platformVersion: string }) => void = () => {};
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: {
        platform: 'Windows',
        mobile: false,
        getHighEntropyValues: () =>
          new Promise((resolve) => {
            resolveDetection = resolve;
          }),
      },
    });

    const { useIsWindows11 } = await load();
    const { createApp } = await import('vue');

    let exposedRef: { value: boolean | null } | undefined;
    const app = createApp({
      setup() {
        exposedRef = useIsWindows11();
        return {};
      },
      render: () => null,
    });
    app.mount(document.createElement('div'));

    app.unmount();
    resolveDetection({ platformVersion: '13.0.0' });
    await new Promise((r) => setTimeout(r, 0));

    expect(exposedRef?.value).toBeNull();
  });

  it('sets the ref normally when detection resolves before unmount', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: {
        platform: 'Windows',
        mobile: false,
        getHighEntropyValues: async () => ({ platformVersion: '13.0.0' }),
      },
    });

    const { useIsWindows11 } = await load();
    const { createApp } = await import('vue');

    let exposedRef: { value: boolean | null } | undefined;
    const app = createApp({
      setup() {
        exposedRef = useIsWindows11();
        return {};
      },
      render: () => null,
    });
    app.mount(document.createElement('div'));

    await new Promise((r) => setTimeout(r, 0));

    expect(exposedRef?.value).toBe(true);
    app.unmount();
  });
});
