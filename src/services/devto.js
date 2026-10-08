const API_URL = 'https://dev.to/api';

const getJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`dev.to responded with ${res.status}`);
  return res.json();
};

export const fetchPosts = (username, perPage = 30) =>
  getJson(`/articles?username=${encodeURIComponent(username)}&per_page=${perPage}`);

export const fetchPost = (id) => getJson(`/articles/${encodeURIComponent(id)}`);

// posts are grouped by where they were published: my own blog or an organization's, like Meteor
export const PERSONAL = 'personal';

export const getSource = (post) => post.organization?.username ?? PERSONAL;

// posts rarely change, so one fetch is enough for a visit
const cache = { staleTime: 5 * 60 * 1000, retry: 1 };

export const postsQuery = (username) => ({
  queryKey: ['blog', username],
  queryFn: () => fetchPosts(username),
  ...cache,
});

export const postQuery = (id) => ({
  queryKey: ['blog-post', id],
  queryFn: () => fetchPost(id),
  ...cache,
});
