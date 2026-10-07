import { useSyncExternalStore } from 'react';

const subscribe = (onChange) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

const getPathname = () => window.location.pathname;

// the History API only fires popstate for Back and Forward, so announce our own changes too
const announce = () => window.dispatchEvent(new PopStateEvent('popstate'));

export const navigate = (path) => {
  if (path === getPathname()) return;
  window.history.pushState({}, '', path);
  announce();
};

export const redirect = (path) => {
  if (path === getPathname()) return;
  window.history.replaceState({}, '', path);
  announce();
};

export const usePathname = () => useSyncExternalStore(subscribe, getPathname);
