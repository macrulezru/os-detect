import { memoizeBoolean } from '../utils/cache';

// A genuine Node.js runtime — a plain Node script, an Electron main
// process, or an Electron/NW.js renderer with Node integration enabled.
// Reads process.versions.node directly rather than reusing
// getNodePlatform()'s navigator-based inference, since this needs to stay
// true even when a real browser-like navigator is also present (an
// Electron/NW.js renderer has both).
export const detectIsNode = memoizeBoolean((): boolean => {
  return (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    process.versions !== null &&
    typeof process.versions.node === 'string'
  );
});
