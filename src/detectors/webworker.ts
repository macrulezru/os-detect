import { memoizeBoolean } from '../utils/cache';

// Dedicated, Shared, or Service Worker context. `importScripts` is defined
// on WorkerGlobalScope (all three worker types inherit from it) and is the
// standard feature-test for "am I in a worker" — `self` without `window`
// alone isn't enough, since plain Node.js has neither `window` nor
// `importScripts` either.
export const detectIsWebWorker = memoizeBoolean((): boolean => {
  return (
    typeof self !== 'undefined' &&
    typeof window === 'undefined' &&
    typeof (self as typeof self & { importScripts?: unknown }).importScripts === 'function'
  );
});
