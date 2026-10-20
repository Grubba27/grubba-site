// Draws the link-preview pictures of the desktop's files into public/og, one per file and theme,
// by taking a screenshot of scripts/og-card.html in a headless Chrome. Posts use their own cover.
//
//   node scripts/og-images.mjs
//
// CHROME points at another Chrome or Chromium binary than the macOS one.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CARD_THEMES, cardPath } from '../src/services/seo.js';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILES = ['about', 'resume', 'contact', 'blog'];

const root = fileURLToPath(new URL('..', import.meta.url));
const card = pathToFileURL(join(root, 'scripts/og-card.html'));
const profile = mkdtempSync(join(tmpdir(), 'og-images-'));

try {
  for (const theme of CARD_THEMES) {
    mkdirSync(join(root, 'public/og', theme), { recursive: true });

    for (const file of FILES) {
      // Chrome picks PNG or JPEG from the extension
      const out = join(root, 'public', cardPath(theme, file));
      card.search = new URLSearchParams({ file, theme });

      execFileSync(CHROME, [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        // the card reads its fonts, icons and wallpaper from the repository
        '--allow-file-access-from-files',
        `--user-data-dir=${profile}`,
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        '--virtual-time-budget=3000',
        `--screenshot=${out}`,
        card.href,
      ], { stdio: 'ignore' });

      console.log(`public${cardPath(theme, file)}`);
    }
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}
