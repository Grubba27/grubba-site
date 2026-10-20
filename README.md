# grubba-site

My personal site, [grubba.dev](https://grubba.dev): a Windows 95 desktop built with React and [React95](https://github.com/React95/React95), based on the [original portfolio by Insaf Khamzin](https://github.com/InsafKhamzin/portfolio).

## Development

Requires Node.js 24 (`nvm use` reads it from `.nvmrc`).

```shell
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serves the production build on http://localhost:4173
npm test         # Vitest
npm run lint     # ESLint
```

## Where things are

- `src/index.jsx` picks the skin for the URL (`src/skins.js`): the Windows 95 desktop for the site, or the deactivated-picture maker for `/deactivated` and for `deactivated.grubba.dev`.
- `src/deactivated` is that maker: `render.js` crops, greys and letters the picture on a canvas in the visitor's browser (nothing is uploaded), `Maker.jsx` holds the controls and `Preview.jsx` shows the result in the shape the chosen platform gives pictures. Its `styles/` carry their own copy of the neo-brutalist tokens and page chrome (the desktop's theme keeps its own inside `src/themes/brutalist.css`, scoped to that theme).
- `src/services/data` holds the content of each file on the desktop (About, Resume, Contact, Blog).
- `src/components` has the desktop, the windows and the taskbar; `src/components/NotepadContent` is what the Notepad shows for each file.
- `src/index.css` and `src/assets/win95` keep the look of React95 2.x (font, cursors, scrollbars), which later versions changed.
- `@react95/core` is pinned to an exact version: `src/components/Window.jsx` and `Taskbar.jsx` restyle parts of its markup to keep that look, so compare the site before and after when bumping it.

## Themes

The desktop has two looks, picked from the Start menu and remembered in the browser. An address can pick one too: `?theme=brutalist` in the URL, or a subdomain named after the theme (`brutalist.grubba.dev`, which is a domain of the Vercel project).

- **Windows 95** is what the components look like by themselves, and the default.
- **Neo-brutalist** is `src/themes/brutalist.css`: one stylesheet scoped to `:root[data-theme='brutalist']`, loaded only for the visitors who pick it. It repaints the same windows, taskbar and files, so every feature exists in both.

A new theme is another stylesheet scoped the same way plus an entry in `src/services/theme.js`. The class names the themes hang on (`window`, `taskbar`, `notepad__page`, `blog-tags`, ...) are set in the components and have no styles of their own.

Each theme has its icons in `public/icons`, and the tab changes to them with the theme. Safari only takes the icon a page has when it finishes loading, which can be before the theme is applied, so the address of a theme doesn't count on that: `vercel.json` redirects `/favicon.ico`, the icon the desktop's page starts with, to the theme's icon on `brutalist.grubba.dev`. Everywhere else `/favicon.ico` is the Windows 95 icon, the same picture as `icons/win95.ico`.

## Deployment

Vercel builds and deploys every push to `master`. `vercel.json` sets the framework and sends every path to the desktop's page, since the open file and blog post live in the URL (`/resume`, `/blog/123`, ...). That page is answered by a function, `api/page.js`, so it can carry the address's own tags (see below). There is no `index.html` on purpose: Vercel serves a file at `/` before it looks at the rewrites, which would keep the host rule below from ever running for the root of the maker's domain. The dev and preview servers follow the same rules, see `vite.config.js`.

`deactivated.grubba.dev` is the same deployment, with the domain added to the Vercel project (Settings, Domains). `vercel.json` sends that host, and the `/deactivated` path on any other, to `deactivated.html`: a second page with its own title, description and link-preview image (`public/deactivated-og.png`), since link previews never run the skin switch. The skin switch in `src/skins.js` still picks the maker for that host and path when the desktop's page is what got served.

## Link previews and search engines

Link previews (Discourse oneboxes, Slack, X, iMessage, ...) and most crawlers read the title, description and picture from the HTML and never run the desktop's script, so every address gets its own tags on the server:

- `src/services/seo.js` decides them: the title, description, canonical URL (always on `grubba.dev`), Open Graph and Twitter tags and structured data of each file, and of each post from dev.to's API (its title, description, cover, reading time and date). Only posts by the blog's author get a page; any other id, or an address that isn't a file, answers 404.
- `api/page.js` is the function `vercel.json` sends the desktop's addresses to. It reads `site.html` back from the deployment and puts the tags in its `page-meta` block. Vercel's CDN keeps the result for an hour (a minute when dev.to didn't answer, in which case the post still opens with the blog's preview).
- `api/sitemap.js` answers `/sitemap.xml` with the files and every post; `robots.txt` points to it.
- The dev server fills in the same tags, and the preview server (`npm run preview`) goes through `api/page.js` itself, so `curl -A Bot http://localhost:4173/blog/<id>` shows what a link preview gets.
- The desktop sets the same title on the tab as files and posts open.

The pictures of the files are in `public/og`, one per file and theme, drawn from `scripts/og-card.html`. After changing the card (or the name or job on it), draw them again with Chrome installed:

```shell
node scripts/og-images.mjs
```

Posts use their dev.to cover, and the Blog picture when they have none.
