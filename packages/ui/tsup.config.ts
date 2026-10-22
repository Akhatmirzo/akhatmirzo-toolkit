import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'charts/index': 'src/charts/index.ts',
    'form/index': 'src/form/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Next.js App Router: komponentlar va hooklar faqat client komponentlarda ishlaydi
  banner: { js: "'use client';" },
});
