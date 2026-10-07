import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Blog from './Blog';

const content = { blog: 'https://dev.to/grubba', username: 'grubba' };

const posts = [
  {
    id: 1,
    title: 'Faster startup in Meteor',
    description: 'A post for the Meteor blog',
    url: 'https://dev.to/meteor/faster-startup',
    readable_publish_date: 'Feb 12',
    reading_time_minutes: 4,
    language: 'en',
    organization: { name: 'Meteor', username: 'meteor' },
  },
  {
    id: 2,
    title: 'Calling Rust from Go',
    description: 'A post of my own',
    url: 'https://dev.to/grubba/calling-rust-from-go',
    readable_publish_date: "Apr 12 '23",
    reading_time_minutes: 3,
    language: 'en',
  },
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

beforeEach(() => {
  window.history.replaceState({}, '', '/blog');
  vi.stubGlobal('fetch', vi.fn((url) => {
    const [, id] = url.match(/\/articles\/(\d+)$/) || [];
    if (!id) return respond(posts);
    const post = posts.find((listed) => String(listed.id) === id);
    return post ? respond({ ...post, body_html: bodies[id] }) : respond({ error: 'not found' }, false);
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('lists my own posts and leaves out the ones written for an organization', async () => {
  renderBlog();

  expect(await screen.findByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Faster startup in Meteor' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Read more on dev.to' })).toHaveAttribute('href', posts[1].url);
});

test('the filter brings in the posts written for an organization', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('checkbox', { name: 'Include the posts I wrote for the Meteor blog' }));

  expect(screen.getByRole('link', { name: 'Faster startup in Meteor' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Calling Rust from Go' })).toBeInTheDocument();
});

test('opens a post in place and goes back to the list', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('button', { name: 'Read here' }));

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

test('keeps the filter when coming back from a post', async () => {
  renderBlog();

  await userEvent.click(await screen.findByRole('checkbox'));
  await userEvent.click(screen.getAllByRole('button', { name: 'Read here' })[1]);
  await userEvent.click(screen.getAllByRole('button', { name: '< Back to posts' })[0]);

  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByRole('link', { name: 'Faster startup in Meteor' })).toBeInTheDocument();
});

test('a post URL opens that post', async () => {
  window.history.replaceState({}, '', '/blog/2');
  renderBlog();

  expect(await screen.findByRole('heading', { name: 'Calling Rust from Go' })).toBeInTheDocument();
  expect(await screen.findByRole('article')).toBeInTheDocument();
});

test('follows the browser history between the list and a post', async () => {
  renderBlog();
  await userEvent.click(await screen.findByRole('button', { name: 'Read here' }));
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
