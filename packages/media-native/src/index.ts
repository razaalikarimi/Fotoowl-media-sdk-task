// ─────────────────────────────────────────────────────────
// media-native — Public API barrel
// ─────────────────────────────────────────────────────────

export { MediaNativeProvider } from './provider/index.js';
export type { MediaNativeProviderProps } from './provider/index.js';

export {
  useMediaClient,
  useMediaSearch,
  useMediaSearchVideos,
  useMediaCurated,
  useMediaItem,
  useMediaEvents,
} from './hooks/index.js';
