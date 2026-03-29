# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
