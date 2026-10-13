import { existsSync, readFileSync } from 'node:fs';
import { DEFAULT_THEME, getInitialTheme, setTheme, THEMES } from './theme';

const iconLink = (rel) => document.head.querySelector(`link[rel="${rel}"]`);

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  delete document.documentElement.dataset.theme;
  // what site.html comes with
  document.head.innerHTML = `
    <link rel="icon" href="/favicon.ico"/>
    <link rel="apple-touch-icon" href="/icons/win95-192.png"/>
  `;
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

test('setting a theme shows its icons', async () => {
  await setTheme('brutalist');

  expect(iconLink('icon')).toHaveAttribute('href', '/icons/brutalist.png');
  expect(iconLink('apple-touch-icon')).toHaveAttribute('href', '/icons/brutalist-192.png');

  await setTheme('win95');

  expect(iconLink('icon')).toHaveAttribute('href', '/icons/win95.ico');
  expect(iconLink('apple-touch-icon')).toHaveAttribute('href', '/icons/win95-192.png');
  expect(document.head.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')).toHaveLength(2);
});

test('an icon that is already shown is left alone', async () => {
  const touchIcon = iconLink('apple-touch-icon');

  await setTheme('win95');

  expect(iconLink('apple-touch-icon')).toBe(touchIcon);
});

// a path that isn't a file gets site.html from the server, which no browser draws as an icon
test('the icons of every theme are files of the site', () => {
  const icons = Object.values(THEMES).flatMap(({ icon, touchIcon }) => [icon, touchIcon]);

  expect(icons).toHaveLength(Object.keys(THEMES).length * 2);
  icons.forEach((icon) => expect(existsSync(`public${icon}`), icon).toBe(true));
});

test('brutalist.grubba.dev answers /favicon.ico with the icon of its theme', () => {
  const { redirects } = JSON.parse(readFileSync('vercel.json', 'utf8'));

  expect(redirects).toContainEqual({
    source: '/favicon.ico',
    has: [{ type: 'host', value: 'brutalist.grubba.dev' }],
    destination: THEMES.brutalist.icon,
    permanent: false,
  });
});

