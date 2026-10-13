import { useSyncExternalStore } from 'react';

// The desktop can be painted in more than one way. Windows 95 is the look the components
// have by themselves; any other theme is a stylesheet scoped to :root[data-theme='<name>'],
// loaded only for the visitors who pick it.
export const THEMES = {
  win95: {
    label: 'Windows 95',
    icon: '/icons/win95.ico',
    touchIcon: '/icons/win95-192.png',
    load: () => Promise.resolve(),
  },
  brutalist: {
    label: 'Neo-brutalist',
    icon: '/icons/brutalist.png',
    touchIcon: '/icons/brutalist-192.png',
    load: () => import('../themes/brutalist'),
  },
};

export const DEFAULT_THEME = 'win95';

const STORAGE_KEY = 'theme';
const isTheme = (name) => Object.hasOwn(THEMES, name ?? '');

// the storage is off limits in some private modes: the theme then lasts for the visit
const remembered = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const remember = (name) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // nothing to do
  }
};

/**
 * The theme to open the site with. An address says it first: ?theme=brutalist in the URL,
 * or a subdomain named after a theme (brutalist.grubba.dev). Otherwise it is the one
 * picked on an earlier visit, and Windows 95 for everybody else.
 */
export const getInitialTheme = ({ search, hostname } = window.location) => {
  const asked = new URLSearchParams(search).get('theme');
  const [subdomain] = hostname.split('.');

  return [asked, subdomain, remembered()].find(isTheme) ?? DEFAULT_THEME;
};

const listeners = new Set();
let current = DEFAULT_THEME;

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// The link is replaced instead of edited, since not every browser notices a new href
// on the one it already has.
const showIcon = (rel, href) => {
  const link = document.head.querySelector(`link[rel="${rel}"]`);
  if (link?.getAttribute('href') === href) return;

  const replacement = document.createElement('link');
  replacement.rel = rel;
  replacement.href = href;

  if (link) link.replaceWith(replacement);
  else document.head.append(replacement);
};

/** Paints the desktop with a theme, down to the icon of the tab, and remembers it for the next visit. */
export const setTheme = async (name) => {
  const theme = THEMES[name];

  // Ahead of the stylesheet, because Safari only takes the icon the page has when it finishes
  // loading. It can still be too late for it: an address that is a theme's own gets the
  // icon from the server instead (see vercel.json).
  showIcon('icon', theme.icon);
  showIcon('apple-touch-icon', theme.touchIcon);

  await theme.load();
  current = name;
  document.documentElement.dataset.theme = name;
  remember(name);
  listeners.forEach((listener) => listener());
};

export const useTheme = () => useSyncExternalStore(subscribe, () => current);
