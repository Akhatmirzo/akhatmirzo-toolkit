import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'ui',
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
