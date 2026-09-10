import { useState, useEffect } from 'react';
import { getOS, detectIsWindows11, getFormFactor, getRuntime, getPrimaryInput } from './index';
import type { OS, FormFactor, Runtime, PrimaryInput } from './index';

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

/**
 * Returns the current device's form factor ('phone' | 'tablet' | 'desktop'
 * | 'tv' | 'unknown'). Detection is synchronous and cached — safe to call
 * on every render.
 */
export function useFormFactor(): FormFactor {
  const [formFactor] = useState<FormFactor>(() => getFormFactor());
  return formFactor;
}

/**
 * Returns the current JS runtime context ('node' | 'browser' | 'webworker'
 * | 'unknown'). Detection is synchronous and cached — safe to call on
 * every render.
 */
export function useRuntime(): Runtime {
  const [runtime] = useState<Runtime>(() => getRuntime());
  return runtime;
}

/**
 * Returns the current primary input type ('mouse' | 'touch' | 'unknown') —
 * updates live if it changes, e.g. a hybrid device's keyboard/mouse being
 * attached or detached.
 */
export function usePrimaryInput(): PrimaryInput {
  const [input, setInput] = useState<PrimaryInput>('unknown');

  useEffect(() => {
    setInput(getPrimaryInput());

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const fineQuery = window.matchMedia('(pointer: fine)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const update = () => setInput(getPrimaryInput());

    fineQuery.addEventListener('change', update);
    coarseQuery.addEventListener('change', update);
    return () => {
      fineQuery.removeEventListener('change', update);
      coarseQuery.removeEventListener('change', update);
    };
  }, []);

  return input;
}
