/**
 * @jest-environment node
 *
 * Genuine Node.js global scope — no jsdom-provided `window`/`document` at
 * all, unlike every other test file in this suite. Needed for the branches
 * of detectIsBrowser()/detectIsWebWorker()/getRuntime() that only trigger
 * when there's truly no `window`, which jsdom can't simulate (its `window`
 * is always present as the global scope itself).
 */

export {};

type OsDetectModule = typeof import('../src/index');

async function load(): Promise<OsDetectModule> {
  jest.resetModules();
  return import('../src/index');
}

describe('Node.js global scope (no window)', () => {
  it('detectIsNode → true', async () => {
    const { detectIsNode } = await load();
    expect(detectIsNode()).toBe(true);
  });

  it('detectIsBrowser → false (no window/document)', async () => {
    const { detectIsBrowser } = await load();
    expect(detectIsBrowser()).toBe(false);
  });

  it('detectIsWebWorker → false (no self)', async () => {
    const { detectIsWebWorker } = await load();
    expect(detectIsWebWorker()).toBe(false);
  });

  it('detectIsPWA → false (no window)', async () => {
    const { detectIsPWA } = await load();
    expect(detectIsPWA()).toBe(false);
  });

  it('getRuntime → node', async () => {
    const { getRuntime } = await load();
    expect(getRuntime()).toBe('node');
  });
});

describe('simulated Web Worker context (self + importScripts, no window)', () => {
  afterEach(() => {
    delete (globalThis as { self?: unknown }).self;
    delete (globalThis as { importScripts?: unknown }).importScripts;
  });

  it('detectIsWebWorker → true', async () => {
    (globalThis as { self?: unknown }).self = globalThis;
    (globalThis as { importScripts?: unknown }).importScripts = () => {};

    const { detectIsWebWorker } = await load();
    expect(detectIsWebWorker()).toBe(true);
  });

  it('self present without importScripts → still false', async () => {
    (globalThis as { self?: unknown }).self = globalThis;

    const { detectIsWebWorker } = await load();
    expect(detectIsWebWorker()).toBe(false);
  });

  it('getRuntime → webworker', async () => {
    (globalThis as { self?: unknown }).self = globalThis;
    (globalThis as { importScripts?: unknown }).importScripts = () => {};

    const { getRuntime } = await load();
    expect(getRuntime()).toBe('webworker');
  });
});
