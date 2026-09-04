# **OS Detect**

![OS Detect](https://github.com/macrulezru/assets/blob/master/packages-images/os-detect.png?raw=true)

Lightweight OS and device-type detection for browsers, Node.js, and SSR — with React hooks and Vue composables. No dependencies.

---

## Features

- **`getOS()`** — returns a typed string identifier for the current OS; detection priority ensures ChromeOS is never misidentified as Linux
- **Boolean functions** — `detectIsIOS()`, `detectIsMacOS()`, `detectIsAndroid()`, `detectIsWindows()`, `detectIsLinux()`, `detectIsChromeOS()` — all synchronous and cached
- **`detectIsWindows11()`** — async; uses `navigator.userAgentData.getHighEntropyValues()` in the browser and `os.release()` in Node.js
- **Device category** — `isMobileDevice()` and `isDesktopDevice()` for quick coarse checks
- **React hooks** — `useOS()` and `useIsWindows11()` from `os-detect/react`
- **Vue composables** — `useOS()` and `useIsWindows11()` from `os-detect/vue` as readonly refs
- **Node.js support** — reads `process.platform` in Node.js (including Node 21+, where the runtime exposes its own synthetic `navigator` global); `detectIsWindows11()` uses `os.release()` build number
- **iPadOS 13+ detection** — correctly identifies iPads that send `Macintosh` in their userAgent via `navigator.maxTouchPoints`
- **Result cache** — every function caches its result after the first call; zero overhead on subsequent calls
- **Zero runtime dependencies** — no external packages; React and Vue are optional peer deps
- **Tree-shakeable ESM** — import only what you use; UMD and CJS bundles also included

**How it works:** in the browser, `navigator.userAgentData.platform` is checked first (Chrome 90+ / Edge 90+, not spoofable by userAgent overrides), falling back to `navigator.userAgent` regex matching for browsers that don't implement it. In Node.js, `process.platform` is read directly — no userAgent parsing happens server-side.

---

## Installation

| Environment | Minimum version                                      |
| ----------- | ------------------------------------------------------ |
| Node.js     | `18+`                                                    |
| React       | `17+` (optional — only needed for `os-detect/react`)     |
| Vue         | `3+` (optional — only needed for `os-detect/vue`)        |

```bash
npm install os-detect
```

React hooks (optional peer dependency):

```bash
npm install react@>=17
```

Vue composables (optional peer dependency):

```bash
npm install vue@>=3
```

A prebuilt UMD bundle is also available via unpkg/jsDelivr — no build step required:

```html
<script src="https://unpkg.com/os-detect/dist/index.umd.js"></script>
<script>
  console.log(OsDetect.getOS())
</script>
```

### Quick start

```ts
import { getOS, detectIsIOS, detectIsWindows, isMobileDevice } from 'os-detect'

console.log(getOS()) // 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'chromeos' | 'unknown'
console.log(detectIsIOS()) // true on iPhone / iPad
console.log(detectIsWindows()) // true on Windows desktop
console.log(isMobileDevice()) // true on iOS or Android
```

All functions are synchronous and cached — safe to call on every render or in any reactive context.

### More examples

#### Vanilla JS

**Tells Windows 11 from Windows 10, not just "Windows"**

Most OS detectors stop at the userAgent string — this one asks the browser's own Client Hints API (or `os.release()` in Node) to actually know.

```ts
import { detectIsWindows11 } from 'os-detect'

const isWin11 = await detectIsWindows11() // true only on Windows 11
```

#### Vue

**The same thing, as a reactive composable**

`useOS()` from `os-detect/vue` returns a readonly `Ref` — detection is synchronous and cached, same as the base function.

```vue
<script setup lang="ts">
import { useOS } from 'os-detect/vue'

const os = useOS() // Readonly<Ref<OS>>
</script>

<template>
  <p>Running on {{ os }}</p>
</template>
```

**Windows 11 as a ready-made reactive Ref**

`useIsWindows11()` starts as `null` and resolves itself to `true`/`false` once the async detection inside `onMounted` completes.

```vue
<script setup lang="ts">
import { useOS, useIsWindows11 } from 'os-detect/vue'

const os = useOS() // Readonly<Ref<OS>>
const isWin11 = useIsWindows11() // Readonly<Ref<boolean | null>>
</script>

<template>
  <p v-if="isWin11 === null">Detecting Windows version…</p>
  <p v-else-if="isWin11">Windows 11</p>
  <p v-else-if="os === 'windows'">Windows 10 or older</p>
  <p v-else>OS: {{ os }}</p>
</template>
```

#### React

**The same hook, as React**

`useOS()` from `os-detect/react` — the value is computed once and stable across re-renders.

```tsx
import { useOS } from 'os-detect/react'

function Banner() {
  const os = useOS() // 'windows' | 'macos' | 'ios' | ...

  return <p>Running on {os}</p>
}
```

**Windows 11 detection inside useEffect**

`useIsWindows11()` starts the async detection inside `useEffect` and updates state once it resolves — `null` while the check is in progress.

```tsx
import { useIsWindows11 } from 'os-detect/react'

function WindowsBadge() {
  const isWin11 = useIsWindows11() // null → true | false

  if (isWin11 === null) return <p>Detecting Windows version…</p>
  return <p>{isWin11 ? 'Windows 11' : 'Windows 10 or older'}</p>
}
```

---

## Documentation & links

- 📖 **Full documentation:** [npm.vuecraft.ru/en/packages/os-detect](https://npm.vuecraft.ru/en/packages/os-detect/guide/overview.html)
- 🌐 **VueCraft:** [vuecraft.ru/en](https://vuecraft.ru/en)
- 👤 **Author:** [macrulez.ru/en](https://macrulez.ru/en)
- 💻 **GitHub:** [macrulezru/os-detect](https://github.com/macrulezru/os-detect)
- 📦 **NPM:** [os-detect](https://www.npmjs.com/package/os-detect)
- 🐛 **Issues:** [github.com/macrulezru/os-detect/issues](https://github.com/macrulezru/os-detect/issues)

---

## License

MIT

---

## 💖 Support the project

Open source takes time and effort. If this library saves you time or brings value, consider supporting further development.

<a href="https://donate.cryptocloud.plus/M6O34NIN" target="_blank">
  <img src="https://img.shields.io/badge/Donate-CryptoCloud-8A2BE2?style=for-the-badge&logo=cryptocurrency&logoColor=white" alt="Donate via CryptoCloud">
</a>

Thank you for being part of this journey. ❤️
