import { useState, useEffect } from 'react';
import { getOS, detectIsWindows11 } from './index';
import type { OS } from './index';

/**
 * Returns the current OS as a string identifier.
 * Detection is synchronous and cached — safe to call on every render.
 */
export function useOS(): OS {
  const [os] = useState<OS>(() => getOS());
  return os;
}

/**
 * Asynchronously detects whether the current device runs Windows 11.
 * Returns null while the detection is in progress, then true or false.
 * Requires navigator.userAgentData (Chrome 90+ / Edge 90+).
 */
export function useIsWindows11(): boolean | null {
  const [isWin11, setIsWin11] = useState<boolean | null>(null);

  useEffect(() => {
    detectIsWindows11().then(setIsWin11);
  }, []);

  return isWin11;
}
