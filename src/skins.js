import { DEACTIVATED_HOST, DEACTIVATED_SECTION } from './deactivated/site';

// The site has more than one skin: the Windows 95 desktop, and a page of its own for the
// deactivated-picture maker. The imports are dynamic so the global CSS of one never reaches
// a page drawn by the other, which is also why going from one to the other is a full page load.
const skins = {
  deactivated: () => import('./deactivated/main.jsx'),
  win95: () => import('./win95.jsx'),
};

export const skinFor = (pathname, hostname = '') => {
  const [, section] = pathname.split('/');

  // the maker has a host of its own, and is also reachable as a path (previews have no such host)
  if (hostname === DEACTIVATED_HOST || section === DEACTIVATED_SECTION) return 'deactivated';

  return 'win95';
};

export const loadSkin = (pathname, hostname) => skins[skinFor(pathname, hostname)]();
