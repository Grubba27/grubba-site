import { createRoot } from 'react-dom/client';
import '@react95/core/themes/win95.css';
import './index.css';
import App from './components/App';
import { getInitialTheme, setTheme } from './services/theme';

// the theme is in place before the first paint, so the desktop never flashes in another one
setTheme(getInitialTheme()).finally(() => {
  createRoot(document.getElementById('root')).render(
    <App/>
  );
});
