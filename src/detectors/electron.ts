import { memoizeBoolean } from '../utils/cache';

// Electron, main or renderer process. `process.versions.electron` is set
// in both (main always; renderer only when Node integration is enabled) —
// the userAgent check is the fallback for a sandboxed/contextIsolated
// renderer, where `process` isn't exposed to page JS at all but Electron
// still appends its own token to the UA. `electron` isn't part of
// @types/node's ProcessVersions, hence the cast — no @types/electron
// dependency for one optional field.
export const detectIsElectron = memoizeBoolean((): boolean => {
  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    process.versions !== null &&
    typeof (process.versions as Record<string, string | undefined>).electron === 'string'
  ) {
    return true;
  }

  return typeof navigator !== 'undefined' && /Electron\//.test(navigator.userAgent);
});
