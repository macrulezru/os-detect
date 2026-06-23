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
