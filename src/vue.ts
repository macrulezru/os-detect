import { ref, readonly, onMounted } from 'vue';
import { getOS, detectIsWindows11 } from './index';
import type { OS } from './index';

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
