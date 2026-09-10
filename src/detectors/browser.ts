import { memoizeBoolean } from '../utils/cache';

// A real DOM/GUI context — a browser tab, or an Electron/NW.js renderer
// process. False in Node.js, in a Web Worker (no `document`), and during
// SSR.
export const detectIsBrowser = memoizeBoolean((): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
});
