<div align="center" style="background:#111827;border-radius:20px;padding:28px 20px 20px;margin-bottom:32px">
  <h1 style="color:#f9fafb;margin:0 0 32px;font-size:2.2em;letter-spacing:-0.03em;font-weight:700;font-family:sans-serif">
    os-detect
  </h1>
  <img
    src="https://s3.twcstorage.ru/c9a2cc89-780f97fd-311d-4a1a-b86f-c25665c9dc46/images/npm/os-detect.webp"
    alt="os-detect"
    style="max-width:100%;width:auto;height:300px;border-radius:12px"
  />
</div>

Lightweight OS and device-type detection for browsers, Node.js, and SSR — with React hooks and Vue composables. No dependencies.

---

## Contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [getOS](#getos)
- [Boolean detection](#boolean-detection)
- [detectIsWindows11](#detectiswindows11)
- [Device category](#device-category)
- [React hooks](#react-hooks)
- [Vue composables](#vue-composables)
- [Node.js & SSR](#nodejs--ssr)
- [UMD / CDN](#umd--cdn)
- [TypeScript types](#typescript-types)
- [Detection strategy](#detection-strategy)
- [Architecture](#architecture)
- [Bundle size & entry points](#bundle-size--entry-points)
- [Migration from v1.x](#migration-from-v1x)

---

## Features

- **`getOS()`** — returns a typed string identifier for the current OS; detection priority ensures ChromeOS is never misidentified as Linux
- **Boolean functions** — `detectIsIOS()`, `detectIsMacOS()`, `detectIsAndroid()`, `detectIsWindows()`, `detectIsLinux()`, `detectIsChromeOS()` — all synchronous and cached
- **`detectIsWindows11()`** — async; uses `navigator.userAgentData.getHighEntropyValues()` in the browser and `os.release()` in Node.js
- **Device category** — `isMobileDevice()` and `isDesktopDevice()` for quick coarse checks
- **React hooks** — `useOS()` and `useIsWindows11()` from `os-detect/react`
- **Vue composables** — `useOS()` and `useIsWindows11()` from `os-detect/vue` as readonly refs
- **Node.js support** — reads `process.platform` when `navigator` is absent; `detectIsWindows11()` uses `os.release()` build number
- **iPadOS 13+ detection** — correctly identifies iPads that send `Macintosh` in their userAgent via `navigator.maxTouchPoints`
- **Result cache** — every function caches its result after the first call; zero overhead on subsequent calls
- **Zero runtime dependencies** — no external packages; React and Vue are optional peer deps
- **Tree-shakeable ESM** — import only what you use; UMD and CJS bundles also included

---

## Installation

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

---

## Quick start

```ts
import {
  getOS,
  detectIsIOS,
  detectIsWindows,
  isMobileDevice,
} from 'os-detect'

console.log(getOS())          // 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'chromeos' | 'unknown'
console.log(detectIsIOS())    // true on iPhone / iPad
console.log(detectIsWindows()) // true on Windows desktop
console.log(isMobileDevice()) // true on iOS or Android
```

All functions are synchronous and cached — safe to call on every render or in any reactive context.

---

## getOS

Returns a single string identifying the current operating system.

```ts
import { getOS } from 'os-detect'

const os = getOS()
// 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'chromeos' | 'unknown'
```

Detection priority (first match wins):

1. iOS / iPadOS
2. Android
3. ChromeOS
4. Linux
5. macOS
6. Windows
7. `'unknown'`

ChromeOS is checked before Linux because ChromeOS userAgent strings contain `"Linux"` — checking in the wrong order would misidentify Chromebooks.

### `OS` type

```ts
type OS = 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'chromeos' | 'unknown'
```

---

## Boolean detection

All functions are synchronous, side-effect-free, and cache their result after the first call.

```ts
import {
  detectIsIOS,
  detectIsMacOS,
  detectIsAndroid,
  detectIsWindows,
  detectIsLinux,
  detectIsChromeOS,
} from 'os-detect'
```

| Function | Returns `true` when | Node.js behaviour |
|---|---|---|
| `detectIsIOS()` | iPhone, iPod, or iPad (including iPadOS 13+) | always `false` |
| `detectIsMacOS()` | macOS desktop (correctly excludes iPadOS 13+) | `process.platform === 'darwin'` |
| `detectIsAndroid()` | Android phones and tablets | `process.platform === 'android'` |
| `detectIsWindows()` | Windows desktop or laptop (32-bit and 64-bit) | `process.platform === 'win32'` |
| `detectIsLinux()` | Linux desktop (excludes Android and ChromeOS) | `process.platform === 'linux'` |
| `detectIsChromeOS()` | ChromeOS devices | always `false` |

### iPadOS 13+ note

Since iPadOS 13, Safari reports `Macintosh` in the userAgent string. `detectIsIOS()` handles this correctly by checking `navigator.maxTouchPoints > 1`. `detectIsMacOS()` excludes iPadOS devices accordingly — you will never get `true` from both functions on the same device.

### Example — conditional rendering

```ts
import { detectIsIOS, detectIsAndroid, detectIsWindows } from 'os-detect'

if (detectIsIOS()) {
  // show App Store badge
} else if (detectIsAndroid()) {
  // show Google Play badge
} else if (detectIsWindows()) {
  // show Windows Store badge
}
```

---

## detectIsWindows11

Asynchronous. Returns `true` only when both `detectIsWindows()` is `true` and the Windows 11 check succeeds.

```ts
import { detectIsWindows11 } from 'os-detect'

const isWin11 = await detectIsWindows11() // Promise<boolean>
```

**Browser** — uses `navigator.userAgentData.getHighEntropyValues(['platformVersion'])` (Chrome 90+ / Edge 90+). Windows 11 reports `platformVersion >= 13.0.0`. Returns `false` if the API is unavailable or the call fails.

**Node.js** — uses `os.release()`. Windows 11 has build number `>= 22000`. Returns `false` if the import fails.

Returns `false` immediately if `detectIsWindows()` is `false` — no async work is done.

```ts
// Differentiate Windows 10 from Windows 11
const isWindows = detectIsWindows()
const isWin11   = await detectIsWindows11()

if (isWin11) {
  console.log('Windows 11')
} else if (isWindows) {
  console.log('Windows 10 or older')
}
```

---

## Device category

Quick coarse checks that group OS values into mobile and desktop buckets.

```ts
import { isMobileDevice, isDesktopDevice } from 'os-detect'

isMobileDevice()   // true if iOS or Android
isDesktopDevice()  // true if macOS, Windows, Linux, or ChromeOS
```

> **Note:** `isMobileDevice()` and `isDesktopDevice()` are **not mutually exclusive**. A device with an unrecognized OS returns `false` for both. There is no overlap on the currently recognised OS values.

---

## React hooks

Import from `os-detect/react`. Requires React 17+.

```tsx
import { useOS, useIsWindows11 } from 'os-detect/react'
```

### `useOS()`

Returns the current OS string synchronously. The value is computed once and stable across re-renders.

```tsx
function Banner() {
  const os = useOS() // 'windows' | 'macos' | 'ios' | ...

  return <p>Running on {os}</p>
}
```

### `useIsWindows11()`

Starts the async detection inside `useEffect` and updates state when it resolves. Returns `null` while the detection is in progress.

```tsx
function WindowsBadge() {
  const isWin11 = useIsWindows11() // null → true | false

  if (isWin11 === null) return <Spinner />
  return <p>{isWin11 ? 'Windows 11' : 'Windows 10 or older'}</p>
}
```

| Hook | Returns | Notes |
|---|---|---|
| `useOS()` | `OS` | Synchronous, cached, stable |
| `useIsWindows11()` | `boolean \| null` | `null` while detecting |

---

## Vue composables

Import from `os-detect/vue`. Requires Vue 3+.

```ts
import { useOS, useIsWindows11 } from 'os-detect/vue'
```

### `useOS()`

Returns a readonly `Ref` with the current OS string. Detection is synchronous and cached.

```vue
<script setup lang="ts">
import { useOS } from 'os-detect/vue'

const os = useOS() // Readonly<Ref<OS>>
</script>

<template>
  <p>Running on {{ os }}</p>
</template>
```

### `useIsWindows11()`

Returns a readonly `Ref` that starts as `null` and resolves to `true` or `false` after the async detection completes inside `onMounted`.

```vue
<script setup lang="ts">
import { useOS, useIsWindows11 } from 'os-detect/vue'

const os      = useOS()           // Readonly<Ref<OS>>
const isWin11 = useIsWindows11()  // Readonly<Ref<boolean | null>>
</script>

<template>
  <p v-if="isWin11 === null">Detecting Windows version…</p>
  <p v-else-if="isWin11">Windows 11</p>
  <p v-else-if="os === 'windows'">Windows 10 or older</p>
  <p v-else>OS: {{ os }}</p>
</template>
```

| Composable | Returns | Notes |
|---|---|---|
| `useOS()` | `Readonly<Ref<OS>>` | Synchronous, cached |
| `useIsWindows11()` | `Readonly<Ref<boolean \| null>>` | `null` while detecting |

---

## Node.js & SSR

All core functions work in Node.js. When `navigator` is absent the library reads `process.platform` instead of the userAgent.

```ts
import { getOS, detectIsWindows, detectIsWindows11 } from 'os-detect'

getOS()            // 'macos' | 'windows' | 'linux' | 'android' | 'unknown'
detectIsWindows()  // true on Windows

const isWin11 = await detectIsWindows11() // uses os.release() build number
```

### `process.platform` mapping

| `process.platform` | Detected as |
|---|---|
| `darwin` | macOS |
| `win32` | Windows (32-bit and 64-bit) |
| `linux` | Linux |
| `android` | Android |
| anything else | `'unknown'` |

Functions that require a browser environment (`detectIsIOS()`, `detectIsChromeOS()`) always return `false` in Node.js — there is no userAgent or `maxTouchPoints` to read.

### SSR hydration note

In Next.js or Nuxt SSR, `getOS()` returns the **server's** OS during server-side rendering — not the client's. To avoid hydration mismatches, run detection only on the client:

**React (Next.js):**

```tsx
import { useEffect, useState } from 'react'
import { getOS } from 'os-detect'
import type { OS } from 'os-detect'

function OSBanner() {
  const [os, setOS] = useState<OS | null>(null)

  useEffect(() => {
    setOS(getOS())
  }, [])

  if (!os) return null
  return <p>OS: {os}</p>
}
```

**Vue (Nuxt):**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOS } from 'os-detect'
import type { OS } from 'os-detect'

const os = ref<OS | null>(null)
onMounted(() => { os.value = getOS() })
</script>

<template>
  <p v-if="os">OS: {{ os }}</p>
</template>
```

Alternatively, use the Vue composable `useOS()` from `os-detect/vue` — it calls `getOS()` inside `ref()` which is evaluated only on the client when used with `<script setup>` and SSR-safe composition.

---

## UMD / CDN

A prebuilt UMD bundle is available via unpkg and jsDelivr — no build step required.

```html
<script src="https://unpkg.com/os-detect/dist/index.umd.js"></script>
<script>
  console.log(OsDetect.getOS())
  console.log(OsDetect.detectIsIOS())
  console.log(OsDetect.isMobileDevice())

  OsDetect.detectIsWindows11().then((isWin11) => {
    console.log('Windows 11:', isWin11)
  })
</script>
```

The global name is `OsDetect`. All functions from the core entry point are exposed on it.

---

## TypeScript types

All public types are exported from the package root:

```ts
import type { OS } from 'os-detect'

// OS is a string union:
// 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'chromeos' | 'unknown'
```

### Narrowing with `getOS()`

```ts
import { getOS } from 'os-detect'
import type { OS } from 'os-detect'

const os: OS = getOS()

switch (os) {
  case 'ios':
  case 'android':
    console.log('Mobile device')
    break
  case 'windows':
  case 'macos':
  case 'linux':
  case 'chromeos':
    console.log('Desktop device')
    break
  case 'unknown':
    console.log('Unrecognised OS')
    break
}
```

TypeScript knows all branches are exhausted after the switch — no need for a `default` case if you handle `'unknown'`.

### React types

`useOS()` returns `OS`. `useIsWindows11()` returns `boolean | null`. Both are fully typed with no extra imports needed.

### Vue types

`useOS()` returns `Readonly<Ref<OS>>`. `useIsWindows11()` returns `Readonly<Ref<boolean | null>>`.

```ts
import type { OS } from 'os-detect'
import { useOS } from 'os-detect/vue'
import type { Ref } from 'vue'

const os: Readonly<Ref<OS>> = useOS()
```

---

## Detection strategy

### Browser

1. **`navigator.userAgentData.platform`** (Chrome 90+ / Edge 90+) — the modern, high-entropy-free platform hint. Reliable and not spoofable by userAgent overrides.
2. **`navigator.userAgent`** — legacy fallback for all other browsers (Firefox, Safari, older Chrome). Regex patterns are kept conservative to avoid false positives.

For Windows 11, an additional async call to `navigator.userAgentData.getHighEntropyValues(['platformVersion'])` is required — this is gated behind `detectIsWindows11()` and never called automatically.

### Node.js

Reads `process.platform` when `navigator` is absent. No userAgent parsing is done server-side. `detectIsWindows11()` dynamically imports the built-in `os` module and parses the build number from `os.release()`.

### Caching

Results are stored in module-level variables after the first call. Subsequent calls return the cached value directly with no DOM or process access. This makes repeated calls in reactive contexts (render functions, computed properties) effectively free.

---

## Architecture

```
os-detect
│
├── src/index.ts  (core entry point)
│     getUADataPlatform()    → navigator.userAgentData.platform (Chrome/Edge)
│     getNodePlatform()      → process.platform (Node.js only)
│
│     detectIsIOS()          → UA + maxTouchPoints (iPadOS 13+ aware)
│     detectIsMacOS()        → UAData / UA / process.platform=darwin
│     detectIsAndroid()      → UAData / UA / process.platform=android
│     detectIsWindows()      → UAData / UA / process.platform=win32
│     detectIsChromeOS()     → UAData / UA (browser only)
│     detectIsLinux()        → UAData / UA / process.platform=linux
│                               (excludes Android and ChromeOS)
│
│     detectIsWindows11()    → async
│       browser: userAgentData.getHighEntropyValues(['platformVersion'])
│                platformVersion >= 13.0.0 → Windows 11
│       Node.js: import('os').release() build number >= 22000
│
│     getOS()               → calls detectors in priority order
│     isMobileDevice()      → detectIsIOS() || detectIsAndroid()
│     isDesktopDevice()     → detectIsMacOS() || detectIsWindows()
│                               || detectIsLinux() || detectIsChromeOS()
│
│     detectIsiOS()         → deprecated alias for detectIsIOS()
│
├── src/react.ts  (os-detect/react)
│     useOS()              → useState(() => getOS())
│     useIsWindows11()     → useState(null) + useEffect → detectIsWindows11()
│
└── src/vue.ts  (os-detect/vue)
      useOS()              → readonly(ref(getOS()))
      useIsWindows11()     → readonly(ref(null)) + onMounted → detectIsWindows11()
```

---

## Bundle size & entry points

| Entry point | Peer deps | Format | Notes |
|---|---|---|---|
| `os-detect` | — | ESM, CJS, UMD | Core — all detection functions and the `OS` type |
| `os-detect/react` | `react >=17` | ESM, CJS | `useOS` and `useIsWindows11` hooks |
| `os-detect/vue` | `vue >=3` | ESM, CJS | `useOS` and `useIsWindows11` composables |

All three entry points are listed in `package.json` exports. The React and Vue adapters add no runtime logic beyond the hooks/composables themselves — they call the same cached core functions.

The package has **zero runtime dependencies**. React and Vue are optional peer dependencies — you only need them if you use the corresponding entry point.

---

## Migration from v1.x

`detectIsiOS()` was renamed to `detectIsIOS()` (capital `OS`) for consistency with the rest of the API.

The old name still works in v2 but logs a deprecation warning and will be removed in v3.0:

```ts
detectIsiOS()    // ⚠ deprecated — logs console.warn in all environments
detectIsIOS()    // ✓ use this instead
```

No other breaking changes between v1 and v2.

---

## License

MIT

---

## Author

Danil Lisin Vladimirovich aka Macrulez

GitHub: [macrulezru](https://github.com/macrulezru) · Website: [macrulez.ru/en](https://macrulez.ru/en)

Bugs and questions — [issues](https://github.com/macrulezru/os-detect/issues)

---

## 💖 Support the project

Open source takes time and effort. If my work saves you time or brings value, consider supporting further development.

<a href="https://donate.cryptocloud.plus/M6O34NIN" target="_blank">
  <img src="https://img.shields.io/badge/Donate-CryptoCloud-8A2BE2?style=for-the-badge&logo=cryptocurrency&logoColor=white" alt="Donate via CryptoCloud">
</a>

Thank you for being part of this journey. ❤️
