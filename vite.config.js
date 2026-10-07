import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      treeshake: {
        // @react95/icons doesn't declare itself side-effect free, so without this
        // all of its ~1000 icons end up in the bundle instead of the dozen in use
        moduleSideEffects: [
          { test: /node_modules[\\/]@react95[\\/]icons[\\/]/, sideEffects: false },
        ],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // both ship ESM that Node can't load as-is (CSS imports, extensionless re-exports)
    server: { deps: { inline: ['@react95/core', '@react95/icons'] } },
  },
});
