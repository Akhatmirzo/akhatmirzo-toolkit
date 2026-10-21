import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'hooks',
    environment: 'jsdom',
  },
});
