import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Blog from './Blog';

const content = { blog: 'https://dev.to/grubba', username: 'grubba' };

const post = (id, title, tag_list, extra = {}) => ({
  id,
  title,
  description: `About ${title}`,
  url: `https://dev.to/grubba/post-${id}`,
  readable_publish_date: 'Feb 12',
  reading_time_minutes: 4,
  language: 'en',
  tag_list,
  ...extra,
});

const posts = [
  post(1, 'Faster startup in Meteor', ['meteor', 'javascript'], {
    url: 'https://dev.to/meteor/post-1',
    organization: { name: 'Meteor', username: 'meteor' },
  }),
  post(2, 'Calling Rust from Go', ['go', 'rust']),
  post(3, 'A typelevel calculator', ['typescript', 'javascript']),
  post(4, 'Discord as a CDN', ['go']),
];

const bodies = {
  2: '<p>Rust and Go can <strong>talk</strong>.</p><script>window.hacked = true</script>',
};

const respond = (body, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) });

const renderBlog = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })}>
      <Blog content={content} />
    </QueryClientProvider>
  );

const listedTitles = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

beforeEach(() => {
  window.history.replaceState({}, '', '/blog');
  vi.stubGlobal('fetch', vi.fn((url) => {
    const [, id] = url.match(/\/articles\/(\d+)$/) || [];
    if (!id) return respond(posts);
    const listed = posts.find((candidate) => String(candidate.id) === id);
    return listed ? respond({ ...listed, body_html: bodies[id] }) : respond({ error: 'not found' }, false);
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('lists my own posts and leaves out the ones written for an organization', async () => {
  renderBlog();

  expect(await screen.findByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  expect(listedTitles()).toEqual(['Calling Rust from Go', 'A typelevel calculator', 'Discord as a CDN']);
  expect(screen.getAllByRole('link', { name: 'Read more on dev.to' })[0]).toHaveAttribute('href', posts[1].url);
  expect(screen.getByText(/#go #rust/)).toBeInTheDocument();
});

test('the checkbox brings in the posts written for an organization', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('checkbox', { name: 'Include the posts I wrote for the Meteor blog' }));

  expect(listedTitles()).toEqual([
    'Faster startup in Meteor',
    'Calling Rust from Go',
    'A typelevel calculator',
    'Discord as a CDN',
  ]);
});

test('offers the dev.to tags shared by the listed posts', async () => {
  renderBlog();
  await screen.findByRole('link', { name: 'Calling Rust from Go' });

  expect(screen.getByRole('button', { name: '#go' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '#rust' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '#javascript' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('checkbox'));

  expect(screen.getByRole('button', { name: '#javascript' })).toBeInTheDocument();
});

test('a tag filters the list and lets go when clicked again', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('button', { name: '#go' }));

  expect(screen.getByRole('button', { name: '#go' })).toHaveAttribute('aria-pressed', 'true');
  expect(listedTitles()).toEqual(['Calling Rust from Go', 'Discord as a CDN']);

  await userEvent.click(screen.getByRole('button', { name: '#go' }));

  expect(screen.getByRole('button', { name: '#go' })).toHaveAttribute('aria-pressed', 'false');
  expect(listedTitles()).toHaveLength(3);
});

test('a tag that is no longer offered stops filtering', async () => {
  renderBlog();
  await userEvent.click(await screen.findByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: '#javascript' }));
  expect(listedTitles()).toEqual(['Faster startup in Meteor', 'A typelevel calculator']);

  await userEvent.click(screen.getByRole('checkbox'));

  expect(listedTitles()).toHaveLength(3);
});

test('opens a post in place and goes back to the list', async () => {
  renderBlog();

  await userEvent.click((await screen.findAllByRole('button', { name: 'Read here' }))[0]);

  expect(window.location.pathname).toBe('/blog/2');
  expect(screen.getByRole('heading', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  const body = await screen.findByRole('article');
  expect(within(body).getByText('talk')).toBeInTheDocument();
  expect(body.querySelector('script')).toBeNull();
  for (const link of screen.getAllByRole('link', { name: 'Read more on dev.to' })) {
    expect(link).toHaveAttribute('href', posts[1].url);
  }

  await userEvent.click(screen.getAllByRole('button', { name: '< Back to posts' })[0]);

  expect(window.location.pathname).toBe('/blog');
  expect(screen.getByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
});

test('the title opens the post in place too', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('link', { name: 'Calling Rust from Go' }));

  expect(window.location.pathname).toBe('/blog/2');
  expect(await screen.findByRole('article')).toBeInTheDocument();
});

test('keeps the filters when coming back from a post', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: '#go' }));
  await userEvent.click(screen.getAllByRole('button', { name: 'Read here' })[0]);
  await userEvent.click(screen.getAllByRole('button', { name: '< Back to posts' })[0]);

  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByRole('button', { name: '#go' })).toHaveAttribute('aria-pressed', 'true');
  expect(listedTitles()).toEqual(['Calling Rust from Go', 'Discord as a CDN']);
});

test('a post URL opens that post', async () => {
  window.history.replaceState({}, '', '/blog/2');
  renderBlog();

  expect(await screen.findByRole('heading', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  expect(await screen.findByRole('article')).toBeInTheDocument();
});

test('follows the browser history between the list and a post', async () => {
  renderBlog();
  await userEvent.click((await screen.findAllByRole('button', { name: 'Read here' }))[0]);
  await screen.findByRole('article');

  window.history.back();

  expect(await screen.findByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

test('says so when a post cannot be loaded', async () => {
  window.history.replaceState({}, '', '/blog/999');
  renderBlog();

  expect(await screen.findByText(/I couldn't load this post right now/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '< Back to posts' })).toBeInTheDocument();
});

test('says so when the list cannot be loaded and can try again', async () => {
  fetch.mockImplementationOnce(() => respond({}, false)).mockImplementationOnce(() => respond({}, false));
  renderBlog();

  expect(await screen.findByText(/I couldn't load the posts right now/)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(await screen.findByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
});
