// Comments live on a Discourse forum; the page URL identifies the thread. Every
// host that serves the blog (grubba.dev, brutalist.grubba.dev, localhost) points
// at the canonical grubba.dev URL so they all share one conversation.
export const FORUM_URL = import.meta.env.VITE_FORUM_URL ?? 'http://localhost:3000';

export const postCommentsUrl = (id) => `https://grubba.dev/blog/${id}`;

// ngrok's free tier answers browser requests with a warning page unless this header is sent
export const forumHeaders = /\.ngrok(-free)?\.(app|dev)$/.test(new URL(FORUM_URL).hostname)
  ? { 'ngrok-skip-browser-warning': '1' }
  : undefined;
