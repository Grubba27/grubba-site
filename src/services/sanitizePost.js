import DOMPurify from 'dompurify';

const DEVTO_ORIGIN = 'https://dev.to';
const YOUTUBE_EMBED = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/;
// dev.to chrome that only makes sense on dev.to itself, and tweet avatars, which no longer load
const DEVTO_ONLY = [
  'highlight__panel',
  'ltag__twitter-tweet__actions',
  'ltag__twitter-tweet__twitter-logo',
  'ltag__twitter-tweet__profile-image',
];

const purify = DOMPurify(window);

purify.addHook('uponSanitizeElement', (node, data) => {
  if (node.nodeType !== 1) return;

  if (DEVTO_ONLY.some((name) => node.classList.contains(name))) {
    node.remove();
    return;
  }

  // iframes are dropped by the sanitizer; keep YouTube embeds reachable as a plain link
  if (data.tagName === 'iframe') {
    const [, videoId] = (node.getAttribute('src') || '').match(YOUTUBE_EMBED) || [];
    if (videoId && node.parentNode) {
      const link = node.ownerDocument.createElement('a');
      link.setAttribute('href', `https://www.youtube.com/watch?v=${videoId}`);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.textContent = 'Watch the video on YouTube';
      node.parentNode.insertBefore(link, node);
    }
  }
});

purify.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName !== 'A' || !node.hasAttribute('href')) return;

  const href = node.getAttribute('href');
  // in-page heading anchors point at ids that only exist on dev.to
  if (href.startsWith('#')) {
    node.removeAttribute('href');
    return;
  }
  if (href.startsWith('/')) node.setAttribute('href', `${DEVTO_ORIGIN}${href}`);
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
});

export const sanitizePostHtml = (html) =>
  purify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['style', 'id', 'name'],
  });
