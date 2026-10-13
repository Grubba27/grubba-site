import { DEFAULT_THEME, getInitialTheme, setTheme } from './theme';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  delete document.documentElement.dataset.theme;
});

test('starts with Windows 95', () => {
  expect(DEFAULT_THEME).toBe('win95');
  expect(getInitialTheme()).toBe('win95');
});

test('starts with the theme picked on an earlier visit', () => {
  window.localStorage.setItem('theme', 'brutalist');

  expect(getInitialTheme()).toBe('brutalist');
});

test('a theme in the URL comes before the one picked earlier', () => {
  window.localStorage.setItem('theme', 'brutalist');
  window.history.replaceState({}, '', '/blog?theme=win95');

  expect(getInitialTheme()).toBe('win95');
});

test('a subdomain named after a theme opens the site in it', () => {
  window.localStorage.setItem('theme', 'win95');

  expect(getInitialTheme({ search: '', hostname: 'brutalist.grubba.dev' })).toBe('brutalist');
  expect(getInitialTheme({ search: '?theme=win95', hostname: 'brutalist.grubba.dev' })).toBe('win95');
  expect(getInitialTheme({ search: '', hostname: 'grubba.dev' })).toBe('win95');
  expect(getInitialTheme({ search: '', hostname: 'www.grubba.dev' })).toBe('win95');
});

test('ignores themes that do not exist', () => {
  window.localStorage.setItem('theme', 'vaporwave');
  window.history.replaceState({}, '', '/?theme=toString');

  expect(getInitialTheme()).toBe('win95');
});

test('setting a theme marks the page and remembers it', async () => {
  await setTheme('brutalist');

  expect(document.documentElement.dataset.theme).toBe('brutalist');
  expect(window.localStorage.getItem('theme')).toBe('brutalist');
  expect(getInitialTheme()).toBe('brutalist');

  await setTheme('win95');

  expect(document.documentElement.dataset.theme).toBe('win95');
});
