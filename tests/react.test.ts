export {};

// react-dom/client's createRoot requires this to be set for act() to work
// without warnings/incorrect batching outside of a testing-library wrapper.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
  return import('../src/react');
}

describe('useIsWindows11 (react)', () => {
  it('does not call setState if the component unmounts before detection resolves', async () => {
    // Regression: detectIsWindows11().then(setIsWin11) had no cleanup guard —
    // resolving after unmount would still call the setState setter. React 18+
    // silently no-ops an unmounted setState with no warning/error (the old
    // "Can't perform a React state update on an unmounted component" warning
    // was removed), so the only reliable way to prove the guard actually
    // works is to intercept the setState call itself, not observe React's
    // console output or re-rendered DOM.
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

    // React's named exports aren't configurable, so jest.spyOn(React, 'useState')
    // can't redefine it directly — mock the module instead, at the require/import
    // level, before anything (react-dom, src/react.ts) resolves it. resetModules()
    // must happen first so all three share the same fresh, mocked registry entry.
    jest.resetModules();
    const setStateCalls: unknown[] = [];
    jest.doMock('react', () => {
      const actual = jest.requireActual('react');
      return {
        ...actual,
        useState: (init?: unknown) => {
          const [state, setState] = actual.useState(init);
          return [
            state,
            (v: unknown) => {
              setStateCalls.push(v);
              setState(v);
            },
          ];
        },
      };
    });

    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { act } = React as unknown as { act: (cb: () => void | Promise<void>) => Promise<void> };

    const { useIsWindows11 } = await import('../src/react');
    function Probe() {
      useIsWindows11();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    await act(() => {
      root.render(React.createElement(Probe));
    });

    await act(() => {
      root.unmount();
    });

    resolveDetection({ platformVersion: '13.0.0' });
    await new Promise((r) => setTimeout(r, 0));

    expect(setStateCalls).toEqual([]);
    jest.dontMock('react');
  });

  it('sets state normally when detection resolves before unmount', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userAgentData: {
        platform: 'Windows',
        mobile: false,
        getHighEntropyValues: async () => ({ platformVersion: '13.0.0' }),
      },
    });

    const { useIsWindows11 } = await load();
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { act } = React as unknown as { act: (cb: () => void | Promise<void>) => Promise<void> };

    let latestValue: boolean | null = null;
    function Probe() {
      latestValue = useIsWindows11();
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(Probe));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(latestValue).toBe(true);
    await act(() => {
      root.unmount();
    });
  });
});
