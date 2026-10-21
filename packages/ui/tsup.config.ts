import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Next.js App Router: komponentlar va hooklar faqat client komponentlarda ishlaydi
  banner: { js: "'use client';" },
});
