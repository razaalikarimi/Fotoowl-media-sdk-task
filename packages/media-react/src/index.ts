// ─────────────────────────────────────────────────────────
// media-react — Public API barrel
// ─────────────────────────────────────────────────────────

export { MediaProvider } from './provider/index.js';
export type { MediaProviderProps } from './provider/index.js';

export {
  useMediaClient,
  useMediaSearch,
  useMediaSearchVideos,
  useMediaCurated,
  useMediaItem,
  useMediaEvents,
} from './hooks/index.js';
