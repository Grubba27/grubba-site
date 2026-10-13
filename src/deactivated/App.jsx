import { useEffect } from 'react';
import { FILE_NAME, PAGE_NAME, PAGE_TAGLINE } from './site';
import Maker from './Maker';

export default function App() {
  useEffect(() => {
    document.title = `${PAGE_NAME} · Gabriel Grubba`;
  }, []);

  return (
    <div className="bx-app" data-theme="deactivated">
      <a className="bx-skip" href="#content">Skip to content</a>
      <header className="bx-header bx-wrap">
        <div>
          <h1 className="bx-header__name">{PAGE_NAME}</h1>
          <p className="bx-header__role">{PAGE_TAGLINE}</p>
        </div>
      </header>
      <div className="bx-wrap bx-desk">
        <main id="content" className="bx-sheet" tabIndex={-1} aria-labelledby="bx-sheet-title">
          <div className="bx-sheet__bar">
            <h2 id="bx-sheet-title" className="bx-sheet__title">{FILE_NAME}</h2>
          </div>
          <div className="bx-sheet__body">
            <Maker />
          </div>
        </main>
      </div>
      <footer className="bx-footer bx-wrap">
        <p className="bx-fine">
          Your picture is opened, drawn and saved in this browser; it is never uploaded. The host
          (Vercel) keeps standard request logs, such as IP addresses. Use pictures you own or may
          use, for your own account. The platforms named in the options are trademarks of their
          owners; this page is not affiliated with any of them.
        </p>
        <ul className="bx-footer__list" role="list">
          <li>
            <a className="bx-link" href="https://grubba.dev">grubba.dev</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
