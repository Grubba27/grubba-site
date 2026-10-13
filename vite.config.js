import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // two pages: the site, and the deactivated-picture maker with a <head> of its own for link previews
  input: { main: 'index.html', deactivated: 'deactivated.html' },
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
    exclude: [...configDefaults.exclude, '.claude/**'],
    // these ship files that Node can't load as-is (CSS imports, extensionless re-exports)
    server: { deps: { inline: ['@react95/core', '@react95/icons', /@fontsource-variable/] } },
  },
});
