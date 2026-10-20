// @vitest-environment node
// api/page.js, the function that serves the desktop (the test can't sit next to it: every file in api/ becomes a function)
import { readFileSync } from 'node:fs';
import page from '../../api/page';

const site = readFileSync(new URL('../../site.html', import.meta.url), 'utf8');

const post = {
  id: 1433307,
  title: 'Calling Rust code from Go - the Gambiarra way',
  description: 'Did you know that Rust...',
  cover_image: null,
  published_at: '2023-04-12T04:27:54Z',
  edited_at: null,
  reading_time_minutes: 3,
  tags: ['go', 'rust'],
  url: 'https://dev.to/grubba/calling-rust-code-from-golang-the-gambiarra-way-13h6',
  user: { name: 'Gabriel Grubba', username: 'grubba' },
};

// site.html from the deployment, and the post from dev.to
const fetchMock = vi.fn(async (url) => String(url).endsWith('/site.html')
  ? new Response(site)
  : new Response(JSON.stringify(post)));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('serves the desktop with the tags of the post', async () => {
  const response = await page.fetch(new Request('https://grubba.dev/api/page?path=/blog/1433307'));
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
  expect(response.headers.get('vercel-cdn-cache-control')).toMatch(/^max-age=3600/);
  expect(html).toContain('<title>Calling Rust code from Go - the Gambiarra way · Gabriel Grubba</title>');
  expect(html).toContain('<meta property="og:title" content="Calling Rust code from Go - the Gambiarra way"/>');
  expect(html).toContain('<script type="module" src="/src/index.jsx"></script>');
  expect(fetchMock).toHaveBeenCalledWith(new URL('https://grubba.dev/site.html'));
});

test("keeps the address's own query, and never leaves its host", async () => {
  const response = await page.fetch(new Request('https://brutalist.grubba.dev/api/page?path=//elsewhere.example/resume&theme=brutalist'));
  const html = await response.text();

  expect(html).toContain('content="https://brutalist.grubba.dev/og/brutalist/about.png"');
  expect(html).not.toContain('elsewhere.example');
});

test('answers HEAD without a body', async () => {
  const response = await page.fetch(new Request('https://grubba.dev/api/page?path=/resume', { method: 'HEAD' }));

  expect(response.status).toBe(200);
  expect(await response.text()).toBe('');
});
