const API_URL = 'https://dev.to/api';

const getJson = async (path, init) => {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    // the status tells a post that doesn't exist from a dev.to that is having a bad day
    throw Object.assign(new Error(`dev.to responded with ${res.status}`), { status: res.status });
  }
  return res.json();
};

export const fetchPosts = (username, perPage = 30, init) =>
  getJson(`/articles?username=${encodeURIComponent(username)}&per_page=${perPage}`, init);

export const fetchPost = (id, init) => getJson(`/articles/${encodeURIComponent(id)}`, init);

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
