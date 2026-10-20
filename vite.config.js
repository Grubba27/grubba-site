import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The two pages of the site. Neither is index.html: a file at / would be served before the host
// rule of vercel.json could send the root of deactivated.grubba.dev to the maker's page.
const PAGES = { site: 'site.html', deactivated: 'deactivated.html' };

// The dev and preview servers follow the rules of vercel.json: the maker's host or path get its
// page, and anything else a browser asks for as a page, and that isn't a file, gets the desktop.
const pageFor = (req) => {
  const url = new URL(req.url, 'http://localhost');
  if ((req.headers.host ?? '').startsWith('deactivated.') || url.pathname === '/deactivated') {
    return `/${PAGES.deactivated}${url.search}`;
  }
  const wantsPage = (req.headers.accept ?? '').includes('text/html');
  const isFile = /\.[a-z0-9]+$/i.test(url.pathname);
  return wantsPage && !isFile ? `/${PAGES.site}${url.search}` : null;
};

const pages = () => {
  const route = (req, _res, next) => {
    const page = pageFor(req);
    if (page) req.url = page;
    next();
  };

  // (nothing is returned from the hooks: Vite would call a returned value as a post-hook)
  return {
    name: 'pages',
    configureServer(server) {
      server.middlewares.use(route);
    },
    configurePreviewServer(server) {
      server.middlewares.use(route);
    },
  };
};

export default defineConfig({
  plugins: [react(), pages()],
  appType: 'mpa',
  input: PAGES,
  // g-comments is linked from a sibling checkout while it is unpublished. Its rebuilds must not
  // hot-reload open tabs: a hot update re-runs the SDK without disposing the previous client.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    fs: { allow: ['.', '../../discourse-comments-sdk'] },
    watch: { ignored: ['**/discourse-comments-sdk/**'] },
  },
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
