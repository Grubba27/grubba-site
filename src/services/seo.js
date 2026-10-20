// What a link to the site shows before any of it runs: the title, description and picture that
// search engines and link previews (Discourse oneboxes, Slack, X, iMessage...) read from the page.
// api/page.js writes them into the desktop's page for each address, the dev server does the same,
// and the desktop keeps the title of the tab in step as files and posts open.
import { about } from './data/about.js';
import { resume } from './data/resume.js';
import { contact } from './data/contact.js';
import { blog } from './data/blog.js';
import { fetchPost } from './devto.js';

export const SITE_URL = 'https://grubba.dev';
export const SITE_NAME = 'Gabriel Grubba';

const DATA = { about, resume, contact, blog };

const twitter = contact.content.social.find(({ name }) => name === 'FaTwitter');
const TWITTER_HANDLE = `@${new URL(twitter.link).pathname.slice(1)}`;

const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'Discourse', url: 'https://www.discourse.org' },
  sameAs: [...contact.content.social.map(({ link }) => link), blog.content.blog],
};

// About.txt is the file the desktop opens with, so it is also the home page
const FILES = {
  about: {
    path: '/',
    title: `${SITE_NAME} · Software Engineer at Discourse`,
    ogTitle: SITE_NAME,
    description: about.content.paragraphs.slice(0, 2).join(' '),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, author: { '@id': PERSON['@id'] } },
        { '@type': 'ProfilePage', url: `${SITE_URL}/`, name: SITE_NAME, mainEntity: PERSON },
      ],
    },
  },
  resume: {
    path: '/resume',
    title: `Resume · ${SITE_NAME}`,
    description: resume.content.summary,
  },
  contact: {
    path: '/contact',
    title: `Contact · ${SITE_NAME}`,
    description: `${contact.content.emailText}${contact.content.email}, or reach me on LinkedIn, GitHub, Instagram and Twitter.`,
  },
  blog: {
    path: '/blog',
    title: `Blog · ${SITE_NAME}`,
    description: 'These are my latest posts from dev.to. Pick one to read it right here.',
  },
};

// the pictures scripts/og-images.mjs draws of each file, and the colour each theme gives it
const CARDS = {
  win95: {
    format: 'jpg',
    colors: { about: '#000e7a', resume: '#000e7a', contact: '#000e7a', blog: '#000e7a' },
  },
  brutalist: {
    format: 'png',
    colors: { about: '#ffd23f', resume: '#ff90b3', contact: '#6fe3a1', blog: '#86b6ff' },
  },
};

export const CARD_THEMES = Object.keys(CARDS);

export const cardPath = (theme, file) => `/og/${theme}/${file}.${CARDS[theme].format}`;

const card = (file, { origin, theme }) => ({
  url: `${origin}${cardPath(theme, file)}`,
  width: 1200,
  height: 630,
  alt: `Notepad - ${DATA[file].name}, open on ${SITE_NAME}'s desktop`,
});

/** The theme an address asks for (see getInitialTheme in theme.js), which picks the picture. */
export const themeFor = (address) => {
  const [subdomain] = address.hostname.split('.');
  return [address.searchParams.get('theme'), subdomain].find((name) => CARD_THEMES.includes(name)) ?? 'win95';
};

/**
 * What an address of the desktop opens: a file, or a post of the blog. Like the desktop,
 * an address it doesn't know opens About.txt, but it is not a page of its own.
 */
export const routeFor = (pathname) => {
  const [, section = '', postId = ''] = pathname.split('/');

  if (section === '') return { file: 'about' };
  if (!Object.hasOwn(FILES, section)) return { file: 'about', missing: true };
  if (section === 'blog' && postId) return { file: 'blog', postId };
  return { file: section };
};

export const fileMeta = (file, { origin = SITE_URL, theme = 'win95' } = {}) => {
  const { path, title, ogTitle = title, description, jsonLd } = FILES[file];

  return {
    title,
    ogTitle,
    description,
    url: `${SITE_URL}${path}`,
    type: 'website',
    image: card(file, { origin, theme }),
    themeColor: CARDS[theme].colors[file],
    jsonLd,
  };
};

// a post is listed with its tags as an array, and fetched on its own with them as a string
const tagsOf = (post) => [post.tags, post.tag_list].find(Array.isArray) ?? [];

// the size dev.to crops a cover to is in the address of the picture
const sizeOf = (imageUrl) => {
  const [, width, height] = imageUrl.match(/width=(\d+),height=(\d+)/) ?? [];
  return width ? { width: Number(width), height: Number(height) } : {};
};

const publishDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** Only posts of the blog's own author get a page, though dev.to would hand out anybody's. */
export const isOwnPost = (post) => post.user?.username === blog.content.username;

export const postMeta = (post, { origin = SITE_URL, theme = 'win95' } = {}) => {
  const url = `${SITE_URL}/blog/${post.id}`;
  const tags = tagsOf(post);
  const image = post.cover_image
    ? { url: post.social_image, ...sizeOf(post.social_image), alt: post.title }
    : card('blog', { origin, theme });

  return {
    title: `${post.title} · ${SITE_NAME}`,
    ogTitle: post.title,
    description: post.description,
    url,
    type: 'article',
    image,
    themeColor: CARDS[theme].colors.blog,
    article: {
      publishedTime: post.published_at,
      modifiedTime: post.edited_at ?? post.published_at,
      tags,
    },
    // Slack and Discourse show these under the description
    labels: [
      ['Reading time', `${post.reading_time_minutes} min read`],
      ['Published', publishDate(post.published_at)],
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      image: image.url,
      datePublished: post.published_at,
      dateModified: post.edited_at ?? post.published_at,
      inLanguage: post.language,
      keywords: tags.join(', '),
      author: { '@type': 'Person', name: post.user.name, url: `${SITE_URL}/` },
      isBasedOn: post.url,
    },
  };
};

const MINUTE = 60;
const HOUR = 60 * MINUTE;

/**
 * Everything the page for an address needs: its status, its meta, and how long the CDN can
 * keep it. A post comes from dev.to; if dev.to doesn't answer in time, the post still opens
 * (the desktop fetches it again), with the blog's preview until the next try.
 */
export const describePage = async (address) => {
  const route = routeFor(address.pathname);
  const context = { origin: address.origin, theme: themeFor(address) };
  const notFound = { status: 404, meta: fileMeta(route.file, context), maxAge: 5 * MINUTE };

  if (route.missing) return notFound;
  if (!route.postId) return { status: 200, meta: fileMeta(route.file, context), maxAge: HOUR };
  if (!/^\d+$/.test(route.postId)) return notFound;

  try {
    const post = await fetchPost(route.postId, { signal: AbortSignal.timeout(3000) });
    if (!isOwnPost(post)) return notFound;
    return { status: 200, meta: postMeta(post, context), maxAge: HOUR };
  } catch (error) {
    if (error.status === 404) return notFound;
    return { status: 200, meta: fileMeta('blog', context), maxAge: MINUTE };
  }
};

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const tag = (name, attributes) =>
  `<${name} ${Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')}/>`;

const property = (name, content) => tag('meta', { property: name, content });
const named = (name, content) => tag('meta', { name, content });

/** The tags for the <head> of a page. */
export const headTags = (meta) => {
  const { image, article, labels = [] } = meta;

  return [
    `<title>${escape(meta.title)}</title>`,
    named('description', meta.description),
    tag('link', { rel: 'canonical', href: meta.url }),
    named('theme-color', meta.themeColor),
    property('og:site_name', SITE_NAME),
    property('og:type', meta.type),
    property('og:title', meta.ogTitle),
    property('og:description', meta.description),
    property('og:url', meta.url),
    property('og:image', image.url),
    ...(image.width ? [property('og:image:width', image.width), property('og:image:height', image.height)] : []),
    property('og:image:alt', image.alt),
    ...(article
      ? [
        property('article:published_time', article.publishedTime),
        property('article:modified_time', article.modifiedTime),
        property('article:author', `${SITE_URL}/`),
        ...article.tags.map((name) => property('article:tag', name)),
      ]
      : []),
    named('twitter:card', 'summary_large_image'),
    named('twitter:site', TWITTER_HANDLE),
    named('twitter:creator', TWITTER_HANDLE),
    ...labels.flatMap(([label, data], index) => [
      named(`twitter:label${index + 1}`, label),
      named(`twitter:data${index + 1}`, data),
    ]),
    // < is escaped so nothing in a title can close the script
    ...(meta.jsonLd
      ? [`<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`]
      : []),
  ].join('\n  ');
};

const META_BLOCK = /(<!--\s*page-meta\b[^>]*-->)[\s\S]*?(<!--\s*\/page-meta\s*-->)/;

/** The page with the tags of `meta` in its page-meta block (see site.html). */
export const renderPage = (html, meta) =>
  html.replace(META_BLOCK, (_, open, close) => `${open}\n  ${headTags(meta)}\n  ${close}`);

/** The title of the tab for a file of the desktop. */
export const fileTitle = (file) => FILES[file]?.title ?? FILES.about.title;

export const postTitle = (post) => `${post.title} · ${SITE_NAME}`;

/** The addresses for search engines to know: the files, and the posts that have a page here. */
export const sitemap = (posts) => {
  const entries = [
    ...Object.values(FILES).map(({ path }) => ({ loc: `${SITE_URL}${path}` })),
    ...posts.filter(isOwnPost).map((post) => ({
      loc: `${SITE_URL}/blog/${post.id}`,
      lastmod: post.edited_at ?? post.published_at,
    })),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ loc, lastmod }) =>
      `  <url><loc>${escape(loc)}</loc>${lastmod ? `<lastmod>${escape(lastmod)}</lastmod>` : ''}</url>`),
    '</urlset>',
    '',
  ].join('\n');
};
