// Every address of the desktop is answered here (see vercel.json), so each one arrives with its
// own title, description and link preview: crawlers and link previews read those from the HTML
// and never run the desktop's script. The page is site.html as built, with the tags of the
// address in its page-meta block.
import { describePage, renderPage } from '../src/services/seo.js';

// site.html is a static file of the same deployment, so it never changes while this one runs
let template;

const loadTemplate = async (origin) => {
  const res = await fetch(new URL('/site.html', origin));
  if (!res.ok) throw new Error(`site.html responded with ${res.status}`);
  return res.text();
};

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    // the rewrite hands over the path that was asked for as ?path, next to the address's own
    // query; it is only ever a path, so it can't move the address to another host
    const url = new URL(request.url);
    const address = new URL(url.origin);
    address.pathname = url.searchParams.get('path') ?? '/';
    url.searchParams.delete('path');
    address.search = url.search;

    const [html, page] = await Promise.all([
      template ?? loadTemplate(url.origin),
      describePage(address),
    ]);
    template = html;

    return new Response(request.method === 'HEAD' ? null : renderPage(html, page.meta), {
      status: page.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // browsers always ask again; Vercel's CDN keeps it, and a new deployment starts afresh
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Vercel-CDN-Cache-Control': `max-age=${page.maxAge}, stale-while-revalidate=86400`,
      },
    });
  },
};
