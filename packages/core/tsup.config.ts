import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'zod/index': 'src/zod/index.ts' },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
