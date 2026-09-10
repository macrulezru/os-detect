import { ref, readonly, onMounted, onUnmounted } from 'vue';
import { getOS, detectIsWindows11, getFormFactor, getRuntime, getPrimaryInput } from './index';
import type { OS, FormFactor, Runtime, PrimaryInput } from './index';

/**
 * Returns the current OS as a readonly ref with a string identifier.
 * Detection is synchronous and cached.
 */
export function useOS() {
  const os = ref<OS>(getOS());
  return readonly(os);
}

/**
 * Asynchronously detects whether the current device runs Windows 11.
 * Returns a readonly ref: null while detecting, then true or false.
 * Requires navigator.userAgentData (Chrome 90+ / Edge 90+).
 */
export function useIsWindows11() {
  const isWin11 = ref<boolean | null>(null);

  onMounted(() => {
    detectIsWindows11().then((value) => {
      isWin11.value = value;
    });
  });

  return readonly(isWin11);
}

/**
 * Returns the current device's form factor ('phone' | 'tablet' | 'desktop'
 * | 'tv' | 'unknown') as a readonly ref. Detection is synchronous and
 * cached, same as useOS().
 */
export function useFormFactor() {
  const formFactor = ref<FormFactor>(getFormFactor());
  return readonly(formFactor);
}

/**
 * Returns the current JS runtime context ('node' | 'browser' | 'webworker'
 * | 'unknown') as a readonly ref. Detection is synchronous and cached, same
 * as useOS().
 */
export function useRuntime() {
  const runtime = ref<Runtime>(getRuntime());
  return readonly(runtime);
}

/**
 * Returns the current primary input type ('mouse' | 'touch' | 'unknown')
 * as a readonly, reactive ref — updates live if it changes, e.g. a hybrid
 * device's keyboard/mouse being attached or detached.
 */
export function usePrimaryInput() {
  const input = ref<PrimaryInput>('unknown');

  let fineQuery: MediaQueryList | undefined;
  let coarseQuery: MediaQueryList | undefined;

  function update() {
    input.value = getPrimaryInput();
  }

  onMounted(() => {
    update();
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    fineQuery = window.matchMedia('(pointer: fine)');
    coarseQuery = window.matchMedia('(pointer: coarse)');
    fineQuery.addEventListener('change', update);
    coarseQuery.addEventListener('change', update);
  });

  onUnmounted(() => {
    fineQuery?.removeEventListener('change', update);
    coarseQuery?.removeEventListener('change', update);
  });

  return readonly(input);
}
