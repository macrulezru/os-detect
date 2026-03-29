import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts', 'src/vue.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'OsDetect',
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
    if (format === 'iife') return { js: '.umd.js' };
    return { js: '.js' };
  },
});
