type Resetter = () => void;

const resetters: Resetter[] = [];

// Wraps a boolean detector so its result is computed once and cached for
// the lifetime of the module. Each wrapped detector registers a resetter so
// resetDetectionCache() can clear every cache at once.
export function memoizeBoolean(detect: () => boolean): () => boolean {
  let cached: boolean | undefined;
  resetters.push(() => {
    cached = undefined;
  });
  return () => {
    if (typeof cached === 'boolean') return cached;
    return (cached = detect());
  };
}

// Same idea as memoizeBoolean, but for a detector whose result can only be
// known asynchronously (detectIsWindows11() needs a real Client Hints
// round-trip in the browser). Caches the resolved value, not the in-flight
// promise object — repeated calls before the first one settles all await the
// same underlying detect() call instead of triggering their own.
export function memoizeAsyncBoolean(detect: () => Promise<boolean>): () => Promise<boolean> {
  let cached: boolean | undefined;
  let pending: Promise<boolean> | undefined;
  resetters.push(() => {
    cached = undefined;
    pending = undefined;
  });
  return () => {
    if (typeof cached === 'boolean') return Promise.resolve(cached);
    if (pending) return pending;
    pending = detect().then((result) => {
      cached = result;
      pending = undefined;
      return result;
    });
    return pending;
  };
}

/**
 * Clears every cached detection result, forcing the next call to each
 * detector to re-evaluate the environment. Detection results don't change
 * during a normal browser session, so this is only needed for advanced
 * cases — e.g. long-running Node.js processes that move between
 * environments, or test suites that need to simulate a different
 * navigator/process.platform without re-importing the module.
 */
export function resetDetectionCache(): void {
  for (const reset of resetters) reset();
}

// Lets other cached/latched state (e.g. a "have I warned about this
// deprecation yet" flag) participate in resetDetectionCache() too, without
// exposing the resetters array itself.
export function registerResetter(reset: Resetter): void {
  resetters.push(reset);
}
