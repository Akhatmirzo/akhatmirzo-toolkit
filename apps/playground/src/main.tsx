import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyTheme, initialTheme } from './theme';
import './index.css';

// Birinchi chizishdan oldin — "miltillash" bo'lmasin
applyTheme(initialTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
