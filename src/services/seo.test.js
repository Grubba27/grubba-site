// @vitest-environment node
import { describePage, headTags, renderPage, routeFor, sitemap, themeFor } from './seo';

const post = {
  id: 1433307,
  title: 'Calling Rust code from Go - the Gambiarra way',
  description: "Did you know that Rust has been voted the 'most loved programming language'...",
  cover_image: 'https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover/cover.jpg',
  social_image: 'https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover/cover.jpg',
  published_at: '2023-04-12T04:27:54Z',
  edited_at: '2023-08-17T18:34:32Z',
  reading_time_minutes: 3,
  tags: ['go', 'rust'],
  tag_list: 'go, rust',
  language: 'en',
  url: 'https://dev.to/grubba/calling-rust-code-from-golang-the-gambiarra-way-13h6',
  user: { name: 'Gabriel Grubba', username: 'grubba' },
};

const answer = (status, body) => vi.fn(async () => new Response(JSON.stringify(body), { status }));

// the content of a <meta> or <link> in the tags, by the attribute that names it
const read = (html, name) =>
  html.match(new RegExp(`(?:property|name|rel)="${name}" (?:content|href)="([^"]*)"`))?.[1];

afterEach(() => {
  vi.unstubAllGlobals();
});

test('reads the file, or the post, from the address', () => {
  expect(routeFor('/')).toEqual({ file: 'about' });
  expect(routeFor('/resume')).toEqual({ file: 'resume' });
  expect(routeFor('/blog')).toEqual({ file: 'blog' });
  expect(routeFor('/blog/1433307')).toEqual({ file: 'blog', postId: '1433307' });
  expect(routeFor('/projects')).toEqual({ file: 'about', missing: true });
});

test('takes the theme of the picture from the query or the subdomain', () => {
  expect(themeFor(new URL('https://grubba.dev/blog'))).toBe('win95');
  expect(themeFor(new URL('https://grubba.dev/blog?theme=brutalist'))).toBe('brutalist');
  expect(themeFor(new URL('https://brutalist.grubba.dev/'))).toBe('brutalist');
});

test("gives a post its own title, description and cover", async () => {
  vi.stubGlobal('fetch', answer(200, post));

  const page = await describePage(new URL('https://grubba.dev/blog/1433307'));
  const tags = headTags(page.meta);

  expect(page.status).toBe(200);
  expect(tags).toContain('<title>Calling Rust code from Go - the Gambiarra way · Gabriel Grubba</title>');
  expect(read(tags, 'og:title')).toBe('Calling Rust code from Go - the Gambiarra way');
  expect(read(tags, 'og:description')).toBe('Did you know that Rust has been voted the &#39;most loved programming language&#39;...');
  expect(read(tags, 'og:type')).toBe('article');
  expect(read(tags, 'og:site_name')).toBe('Gabriel Grubba');
  expect(read(tags, 'og:url')).toBe('https://grubba.dev/blog/1433307');
  expect(read(tags, 'canonical')).toBe('https://grubba.dev/blog/1433307');
  expect(read(tags, 'og:image')).toBe(post.social_image);
  expect(read(tags, 'og:image:width')).toBe('1000');
  expect(read(tags, 'og:image:height')).toBe('500');
  expect(read(tags, 'twitter:card')).toBe('summary_large_image');
  expect(read(tags, 'twitter:label1')).toBe('Reading time');
  expect(read(tags, 'twitter:data1')).toBe('3 min read');
  expect(read(tags, 'twitter:data2')).toBe('Apr 12, 2023');
  expect(tags).toContain('"@type":"BlogPosting"');
});

test('pictures a post without a cover with the blog, in the theme of the address', async () => {
  vi.stubGlobal('fetch', answer(200, { ...post, cover_image: null, social_image: 'https://dev.to/social_previews/article/1.png' }));

  const page = await describePage(new URL('https://brutalist.grubba.dev/blog/1433307'));

  expect(page.meta.image.url).toBe('https://brutalist.grubba.dev/og/brutalist/blog.png');
  expect(page.meta.url).toBe('https://grubba.dev/blog/1433307');
});

test("doesn't give a page to a post by somebody else", async () => {
  vi.stubGlobal('fetch', answer(200, { ...post, title: 'Not mine', user: { name: 'Someone', username: 'someone' } }));

  const page = await describePage(new URL('https://grubba.dev/blog/1'));

  expect(page.status).toBe(404);
  expect(headTags(page.meta)).not.toContain('Not mine');
});

test("answers 404 for a post dev.to doesn't have, and for an address that isn't a file", async () => {
  vi.stubGlobal('fetch', answer(404, { error: 'not found' }));

  expect((await describePage(new URL('https://grubba.dev/blog/1'))).status).toBe(404);
  expect((await describePage(new URL('https://grubba.dev/blog/not-a-post'))).status).toBe(404);
  expect((await describePage(new URL('https://grubba.dev/projects'))).status).toBe(404);
});

test("still opens a post when dev.to doesn't answer, for a short while with the blog's preview", async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));

  const page = await describePage(new URL('https://grubba.dev/blog/1433307'));

  expect(page.status).toBe(200);
  expect(page.meta.title).toBe('Blog · Gabriel Grubba');
  expect(page.maxAge).toBe(60);
});

test('describes each file of the desktop with its own picture', async () => {
  const home = (await describePage(new URL('https://grubba.dev/'))).meta;
  const resume = (await describePage(new URL('https://grubba.dev/resume'))).meta;

  expect(home.ogTitle).toBe('Gabriel Grubba');
  expect(home.description).toMatch(/^Hi, I'm Gabriel Grubba, a software engineer at Discourse\./);
  expect(home.image.url).toBe('https://grubba.dev/og/win95/about.jpg');
  expect(home.url).toBe('https://grubba.dev/');
  expect(resume.title).toBe('Resume · Gabriel Grubba');
  expect(resume.image.url).toBe('https://grubba.dev/og/win95/resume.jpg');
  expect(resume.url).toBe('https://grubba.dev/resume');
});

test("keeps a title from breaking out of the tags or the structured data", () => {
  const tags = headTags({
    ...post,
    title: '</title><script>alert(1)</script>',
    ogTitle: '"><script>alert(1)</script>',
    url: 'https://grubba.dev/blog/1',
    type: 'article',
    image: { url: 'https://grubba.dev/og/win95/blog.jpg', alt: '' },
    jsonLd: { headline: '</script><script>alert(1)</script>' },
  });

  expect(tags).not.toContain('<script>alert(1)');
});

test('puts the tags in the page-meta block of the page', () => {
  const html = '<head>\n  <!-- page-meta -->\n  <title>Gabriel Grubba</title>\n  <!-- /page-meta -->\n</head>';
  const page = renderPage(html, { ...post, title: 'Costs $1', ogTitle: 'Costs $1', url: 'https://grubba.dev/blog/1', type: 'article', image: { url: 'x', alt: '' } });

  expect(page).toContain('<title>Costs $1</title>');
  expect(page).not.toContain('<title>Gabriel Grubba</title>');
  expect(page).toContain('<!-- /page-meta -->');
});

test('lists the files and the own posts in the sitemap', () => {
  const xml = sitemap([post, { ...post, id: 1, user: { username: 'someone' } }]);

  expect(xml).toContain('<loc>https://grubba.dev/</loc>');
  expect(xml).toContain('<loc>https://grubba.dev/resume</loc>');
  expect(xml).toContain('<url><loc>https://grubba.dev/blog/1433307</loc><lastmod>2023-08-17T18:34:32Z</lastmod></url>');
  expect(xml).not.toContain('/blog/1<');
});
