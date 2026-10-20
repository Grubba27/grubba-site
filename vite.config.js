import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import pageFunction from './api/page.js';
import sitemapFunction from './api/sitemap.js';
import { describePage, renderPage, SITE_URL } from './src/services/seo.js';

// The two pages of the site. Neither is index.html: a file at / would be served before the host
// rule of vercel.json could send the root of deactivated.grubba.dev to the maker's page.
const PAGES = { site: 'site.html', deactivated: 'deactivated.html' };

// The dev and preview servers follow the rules of vercel.json: the maker's host or path get its
// page, the sitemap and the desktop's addresses are answered by the functions in api/, and
// anything else a browser asks for as a page, and that isn't a file, gets the desktop.
const isFile = (pathname) => /\.[a-z0-9]+$/i.test(pathname);

const pageFor = (req) => {
  const url = new URL(req.url, 'http://localhost');
  if ((req.headers.host ?? '').startsWith('deactivated.') || url.pathname === '/deactivated') {
    return `/${PAGES.deactivated}${url.search}`;
  }
  const wantsPage = (req.headers.accept ?? '').includes('text/html');
  return wantsPage && !isFile(url.pathname) ? `/${PAGES.site}${url.search}` : null;
};

// answers the way Vercel runs a function: a Request in, a Response out
const run = async (fn, req, res, path) => {
  const response = await fn.fetch(new Request(new URL(path, `http://${req.headers.host}`), {
    method: req.method,
    headers: { accept: req.headers.accept ?? '*/*' },
  }));
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
};

const pages = () => {
  const route = (req, _res, next) => {
    const page = pageFor(req);
    if (page) req.url = page;
    next();
  };

  const sitemap = (req, res, next) => {
    if (new URL(req.url, 'http://localhost').pathname !== '/sitemap.xml') return next();
    run(sitemapFunction, req, res, req.url).catch(next);
  };

  // The built desktop goes through api/page.js, the same as on Vercel: it reads site.html
  // back from this server and fills in the address's tags.
  const previewRoute = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    const page = pageFor(req);
    if (page?.startsWith(`/${PAGES.deactivated}`)) return route(req, res, next);
    if (isFile(url.pathname)) return next();

    const query = new URLSearchParams(url.search);
    query.set('path', url.pathname);
    run(pageFunction, req, res, `/api/page?${query}`).catch(next);
  };

  // (nothing is returned from the hooks: Vite would call a returned value as a post-hook)
  return {
    name: 'pages',
    configureServer(server) {
      server.middlewares.use(sitemap);
      server.middlewares.use(route);
    },
    configurePreviewServer(server) {
      server.middlewares.use(sitemap);
      server.middlewares.use(previewRoute);
    },
    // the dev server fills in the tags of the address it was asked for; the build, the home's
    async transformIndexHtml(html, { filename, originalUrl, server }) {
      if (!filename.endsWith(PAGES.site)) return html;
      const address = server
        ? new URL(originalUrl ?? '/', server.resolvedUrls?.local[0] ?? 'http://localhost')
        : new URL(SITE_URL);
      return renderPage(html, (await describePage(address)).meta);
    },
  };
};

export default defineConfig({
  plugins: [react(), pages()],
  appType: 'mpa',
  input: PAGES,
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
