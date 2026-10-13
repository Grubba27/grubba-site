import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// opsz.css is the cut with the optical-size axis: big headings get the display drawing
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
