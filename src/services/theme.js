import { useSyncExternalStore } from 'react';

// The desktop can be painted in more than one way. Windows 95 is the look the components
// have by themselves; any other theme is a stylesheet scoped to :root[data-theme='<name>'],
// loaded only for the visitors who pick it.
export const THEMES = {
  win95: { label: 'Windows 95', load: () => Promise.resolve() },
  brutalist: { label: 'Neo-brutalist', load: () => import('../themes/brutalist') },
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

/** Paints the desktop with a theme and remembers it for the next visit. */
export const setTheme = async (name) => {
  await THEMES[name].load();
  current = name;
  document.documentElement.dataset.theme = name;
  remember(name);
  listeners.forEach((listener) => listener());
};

export const useTheme = () => useSyncExternalStore(subscribe, () => current);
