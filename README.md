<div align="center" style="background:#111827;border-radius:20px;padding:28px 20px 20px;margin-bottom:32px">
  <h1 style="color:#f9fafb;margin:0 0 32px;font-size:2.2em;letter-spacing:-0.03em;font-weight:700;font-family:sans-serif">
    os-detect
  </h1>
  <img
    src="https://s3.twcstorage.ru/c9a2cc89-780f97fd-311d-4a1a-b86f-c25665c9dc46/images/npm/os-detect.webp"
    alt="vue-virtual-scroller-kit"
    style="max-width:100%;width:auto;height:300px;border-radius:12px"
  />
</div>

A lightweight utility for detecting the operating system and device type — in browsers, Node.js, and SSR. With React hooks and Vue composables. No dependencies.

## Installation

```bash
npm install os-detect
```

## Usage

```ts
import {
  getOS,
  detectIsIOS, detectIsMacOS, detectIsAndroid,
  detectIsWindows, detectIsLinux, detectIsChromeOS,
  detectIsWindows11,
  isMobileDevice, isDesktopDevice,
} from 'os-detect';

// Get OS as a string
getOS();               // 'ios' | 'macos' | 'android' | 'windows' | 'linux' | 'chromeos' | 'unknown'

// Boolean detection
detectIsIOS();         // true on iPhone, iPod, iPad (including iPadOS 13+)
detectIsMacOS();       // true on macOS desktop (correctly excludes iPadOS 13+)
detectIsAndroid();     // true on Android phones and tablets
detectIsWindows();     // true on Windows desktop or laptop
detectIsLinux();       // true on Linux desktop (excludes Android and ChromeOS)
detectIsChromeOS();    // true on ChromeOS devices

// Async: Windows 11 check
const isWin11 = await detectIsWindows11();   // true | false

// Device category
isMobileDevice();      // true if iOS or Android
isDesktopDevice();     // true if macOS, Windows, Linux, or ChromeOS
```

CommonJS:
```js
const { getOS, detectIsIOS, isMobileDevice } = require('os-detect');
```

UMD via `<script>` tag:
```html
<script src="https://unpkg.com/os-detect/dist/index.umd.js"></script>
<script>
  console.log(OsDetect.getOS());
  console.log(OsDetect.detectIsIOS());
  console.log(OsDetect.isMobileDevice());
</script>
```

---

## React

```tsx
import { useOS, useIsWindows11 } from 'os-detect/react';

function App() {
  const os = useOS();                 // 'windows' | 'macos' | 'ios' | ...
  const isWin11 = useIsWindows11();   // null (loading) → true | false

  return (
    <div>
      <p>OS: {os}</p>
      {isWin11 === null && <p>Detecting Windows version...</p>}
      {isWin11 === true && <p>Windows 11</p>}
      {isWin11 === false && os === 'windows' && <p>Windows 10 or older</p>}
    </div>
  );
}
```

Requires React 17+.

---

## Vue

```vue
<script setup lang="ts">
import { useOS, useIsWindows11 } from 'os-detect/vue';

const os = useOS();               // Readonly<Ref<OS>>
const isWin11 = useIsWindows11(); // Readonly<Ref<boolean | null>>
</script>

<template>
  <p>OS: {{ os }}</p>
  <p v-if="isWin11 === null">Detecting Windows version...</p>
  <p v-else-if="isWin11">Windows 11</p>
  <p v-else-if="os === 'windows'">Windows 10 or older</p>
</template>
```

Requires Vue 3+.

---

## Node.js & SSR

All functions work in Node.js via `process.platform`:

```ts
import { getOS, detectIsWindows, detectIsWindows11 } from 'os-detect';

// Reads process.platform — no browser required
getOS();            // 'macos' | 'windows' | 'linux' | 'android' | 'unknown'
detectIsWindows();  // true on Windows

// Windows 11 via os.release() build number (>= 22000)
const isWin11 = await detectIsWindows11();
```

| `process.platform` | Detected as |
|---|---|
| `darwin` | macOS |
| `win32` | Windows (32-bit and 64-bit) |
| `linux` | Linux |
| `android` | Android |

Functions that require a browser environment (`detectIsIOS()`, `detectIsChromeOS()`) always return `false` in Node.js.

> **SSR hydration note**: In Next.js / Nuxt SSR, `getOS()` returns the **server's** OS, not the client's. To avoid hydration mismatches, wrap detection in `useEffect` (React) or `onMounted` (Vue) so it runs only on the client.

---

## API Reference

### OS String Detection

| Function | Returns |
|---|---|
| `getOS()` | `'ios'` \| `'macos'` \| `'android'` \| `'windows'` \| `'linux'` \| `'chromeos'` \| `'unknown'` |

### Boolean Detection

| Function | Returns `true` when | Node.js |
|---|---|---|
| `detectIsIOS()` | iPhone, iPod, or iPad (including iPadOS 13+) | always `false` |
| `detectIsMacOS()` | macOS desktop (excludes iPadOS 13+) | `process.platform === 'darwin'` |
| `detectIsAndroid()` | Android phones and tablets | `process.platform === 'android'` |
| `detectIsWindows()` | Windows desktop or laptop | `process.platform === 'win32'` |
| `detectIsLinux()` | Linux desktop (excludes Android and ChromeOS) | `process.platform === 'linux'` |
| `detectIsChromeOS()` | ChromeOS devices | always `false` |
| `detectIsWindows11()` | Windows 11 — **async**, `Promise<boolean>` | via `os.release()` |

### Device Category

| Function | Returns `true` when |
|---|---|
| `isMobileDevice()` | iOS or Android |
| `isDesktopDevice()` | macOS, Windows, Linux, or ChromeOS |

> `isMobileDevice()` and `isDesktopDevice()` are **not mutually exclusive** — a device with an unrecognized OS returns `false` for both.

### React Hooks

Import from `os-detect/react`:

| Hook | Returns |
|---|---|
| `useOS()` | `OS` string — synchronous, cached |
| `useIsWindows11()` | `boolean \| null` — `null` while detecting |

### Vue Composables

Import from `os-detect/vue`:

| Composable | Returns |
|---|---|
| `useOS()` | `Readonly<Ref<OS>>` — synchronous, cached |
| `useIsWindows11()` | `Readonly<Ref<boolean \| null>>` — `null` while detecting |

---

## Detection Strategy

**Browser**: prefers `navigator.userAgentData` (Chrome 90+ / Edge 90+), falls back to `navigator.userAgent` for all other browsers.

**Node.js**: reads `process.platform` when `navigator` is absent.

Results are cached after the first call — subsequent calls have zero overhead.

`detectIsWindows11()` in the browser uses `userAgentData.getHighEntropyValues(['platformVersion'])` — Windows 11 reports `platformVersion >= 13.0.0`. In Node.js it uses `os.release()` — Windows 11 has build number `>= 22000`. Returns `false` if the API is unavailable or the call fails.

### iPadOS 13+ note

Since iPadOS 13, Safari sends `Macintosh` in the userAgent string. `detectIsIOS()` correctly identifies these devices using `navigator.maxTouchPoints > 1`, and `detectIsMacOS()` excludes them accordingly.

---

## Migration from v1.x

`detectIsiOS()` was renamed to `detectIsIOS()`. The old name still works but logs a deprecation warning and will be removed in v3.0.

```ts
detectIsiOS()    // deprecated — logs console.warn
detectIsIOS()    // use this instead
```

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