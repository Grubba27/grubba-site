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

- `src/services/data` holds the content of each file on the desktop (About, Resume, Contact, Blog).
- `src/components` has the desktop, the windows and the taskbar; `src/components/NotepadContent` is what the Notepad shows for each file.
- `src/index.css` and `src/assets/win95` keep the look of React95 2.x (font, cursors, scrollbars), which later versions changed.
- `@react95/core` is pinned to an exact version: `src/components/Window.jsx` and `Taskbar.jsx` restyle parts of its markup to keep that look, so compare the site before and after when bumping it.

## Deployment

Vercel builds and deploys every push to `master`. `vercel.json` sets the framework and sends every path to `index.html`, since the open file and blog post live in the URL (`/resume`, `/blog/123`, ...).
