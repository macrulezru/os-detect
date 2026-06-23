# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed
- **Bug**: `dist/vue.umd.js` shipped at ~2.2 MB because the UMD/IIFE build inlined the entire Vue runtime instead of treating `vue` as external (esbuild can't leave an external unresolved in `iife` format without a global mapping). UMD/IIFE is now only built for the core `index.ts` entry point; published package size dropped from ~441 KB / 2.3 MB unpacked to ~13 KB / 72 KB unpacked.

### Added
- `resetDetectionCache()` — clears every cached detection result. Documented advanced API for long-running Node.js processes or test suites; not needed in normal browser usage.
- Playwright e2e suite (`e2e/`, `npm run test:e2e`) exercising the built UMD bundle against real Chromium, Firefox, and WebKit engines, in addition to the existing jsdom-based unit tests.

### Changed
- `src/index.ts` split into `src/utils/{platform,cache}.ts` and `src/detectors/{ios,macos,android,windows,linux,chromeos}.ts`. Public API is unchanged.
- Windows 11 detection thresholds (build number 22000, platform-version major 13) are now named constants with sourced comments instead of inline magic numbers.
- `coverage/` is no longer committed to git.

## [2.0.0] - 2026-03-29

### Breaking Changes
- `detectIsiOS` renamed to `detectIsIOS` (old alias kept with deprecation warning, removed in v3.0)
- Entry points changed: `main` now points to `dist/index.js`
- Package now ships only `dist/` directory

### Added
- TypeScript source in `src/index.ts` with full type declarations (`dist/index.d.ts`)
- ESM build (`dist/index.mjs`)
- UMD/IIFE build (`dist/index.umd.js`) for `<script>` tag usage
- Support for `navigator.userAgentData` (Chrome 90+) as primary detection method
- iPadOS 13+ now correctly detected as iOS, not macOS (uses `maxTouchPoints > 1`)
- Deprecated alias `detectIsiOS` with `console.warn`
- Tests via Jest + jsdom
- `sideEffects: false` for tree-shaking support
- `exports` field in package.json for modern bundlers

### Fixed
- **Bug**: iPadOS 13+ was incorrectly detected as macOS due to spoofed `Macintosh` userAgent
- Removed obsolete `window.MSStream` check (IE10/Windows Phone — end of life 2019)

## [1.0.1] - 2025-01-01

- Initial CommonJS implementation
