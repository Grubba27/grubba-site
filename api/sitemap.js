// /sitemap.xml (see vercel.json): the desktop's files and every post of the blog.
import { blog } from '../src/services/data/blog.js';
import { fetchPosts } from '../src/services/devto.js';
import { sitemap } from '../src/services/seo.js';

export default {
  async fetch() {
    try {
      const posts = await fetchPosts(blog.content.username, 1000, { signal: AbortSignal.timeout(5000) });

      return new Response(sitemap(posts), {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Vercel-CDN-Cache-Control': 'max-age=86400, stale-while-revalidate=604800',
        },
      });
    } catch {
      // without the posts the map would be wrong; search engines come back for it later
      return new Response('dev.to is not answering right now', { status: 503, headers: { 'Retry-After': '3600' } });
    }
  },
};
