import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 'node' is enough for pure logic in game.js. Switch to 'jsdom' if a test
    // needs document/window (e.g. testing code that touches the canvas/DOM).
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});
