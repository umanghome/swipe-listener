import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    // Unminified UMD output
    {
      file: 'dist/swipe-listener.js',
      format: 'umd',
      name: 'SwipeListener',
      sourcemap: true,
    },
    // Minified UMD output
    {
      file: 'dist/swipe-listener.min.js',
      format: 'umd',
      name: 'SwipeListener',
      sourcemap: true,
      plugins: [terser()], // Minifies this output
    },
    // Unminified ESM output
    {
      file: 'dist/swipe-listener.mjs',
      format: 'esm',
      sourcemap: true,
    },
    // Minified ESM output
    {
      file: 'dist/swipe-listener.min.mjs',
      format: 'esm',
      sourcemap: true,
      plugins: [terser()], // Minifies this output
    },
  ],
  plugins: [resolve(), commonjs(), typescript()],
};
