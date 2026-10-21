import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Workspace paketlari build qilinmasdan, to'g'ridan-to'g'ri src'dan olinadi (HMR bilan)
    conditions: ['source', ...defaultClientConditions],
  },
  server: { port: 5173 },
});
