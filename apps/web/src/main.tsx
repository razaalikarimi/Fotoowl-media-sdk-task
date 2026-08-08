import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createMediaClient } from '@media-sdk/media-core';
import { MediaProvider } from '@media-sdk/media-react';
import { App } from './App.js';
import './styles/index.css';

// ─── SDK Initialization ───
// The API key is configured here, at the app boundary.
// It flows through MediaProvider → context → hooks.
// No other part of the app handles the key directly.

const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string;

if (!apiKey) {
  console.warn(
    '[MediaSDK] No VITE_PEXELS_API_KEY found in environment variables. ' +
      'Copy .env.example to .env and add your Pexels API key.',
  );
}

const client = createMediaClient({
  apiKey: apiKey || 'MISSING_KEY',
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <MediaProvider client={client}>
      <App />
    </MediaProvider>
  </StrictMode>,
);
