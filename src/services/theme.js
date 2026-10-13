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

/** The theme asked for in the URL (?theme=brutalist), else the one picked before, else Windows 95. */
export const getInitialTheme = () => {
  const asked = new URLSearchParams(window.location.search).get('theme');

  return [asked, remembered()].find(isTheme) ?? DEFAULT_THEME;
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
