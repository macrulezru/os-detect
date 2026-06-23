import { defineConfig } from 'tsup';

// The UMD/IIFE build only ever targets src/index.ts (the only entry meant for
// plain <script> tag usage) and is built as its own job. Building iife for
// react.ts/vue.ts would make esbuild inline the whole peer dependency (e.g.
// the entire Vue runtime) instead of leaving it external — iife has no
// mechanism to resolve an external import to a global at runtime.
export default defineConfig([
  {
    entry: ['src/index.ts', 'src/react.ts', 'src/vue.ts'],
    format: ['cjs', 'esm'],
    target: 'es2017',
    dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
    clean: true,
    sourcemap: false,
    minify: false,
    splitting: false,
    outDir: 'dist',
    external: ['react', 'vue', 'os'],
    outExtension({ format }) {
      if (format === 'esm') return { js: '.mjs' };
      return { js: '.js' };
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'OsDetect',
    target: 'es2017',
    dts: false,
    clean: false,
    sourcemap: false,
    minify: false,
    splitting: false,
    outDir: 'dist',
    external: ['os'],
    outExtension: () => ({ js: '.umd.js' }),
  },
]);
