import { skinFor } from './skins';

test('the deactivated-picture maker has its own skin, by host or by path', () => {
  expect(skinFor('/', 'deactivated.grubba.dev')).toBe('deactivated');
  expect(skinFor('/anything', 'deactivated.grubba.dev')).toBe('deactivated');
  expect(skinFor('/deactivated', 'grubba.dev')).toBe('deactivated');
  expect(skinFor('/deactivated/', 'grubba-site-abc.vercel.app')).toBe('deactivated');
  expect(skinFor('/deactivated')).toBe('deactivated');
});

test('everything else is the Windows 95 desktop', () => {
  expect(skinFor('/', 'grubba.dev')).toBe('win95');
  expect(skinFor('/about', 'grubba.dev')).toBe('win95');
  expect(skinFor('/resume')).toBe('win95');
  expect(skinFor('/deactivated-accounts')).toBe('win95');
});
