const API_URL = 'https://dev.to/api';

const getJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`dev.to responded with ${res.status}`);
  return res.json();
};

export const fetchPosts = (username, perPage = 15) =>
  getJson(`/articles?username=${encodeURIComponent(username)}&per_page=${perPage}`);

export const fetchPost = (id) => getJson(`/articles/${id}`);
