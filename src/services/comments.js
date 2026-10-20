// Comments live on a Discourse forum; the page URL identifies the thread. Every
// host that serves the blog (grubba.dev, brutalist.grubba.dev, localhost) points
// at the canonical grubba.dev URL so they all share one conversation.
export const FORUM_URL = import.meta.env.VITE_FORUM_URL ?? 'http://localhost:3000';

export const postCommentsUrl = (id) => `https://grubba.dev/blog/${id}`;
