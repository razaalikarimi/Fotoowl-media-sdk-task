// ─────────────────────────────────────────────────────────
// media-core — Public API barrel
// ─────────────────────────────────────────────────────────
//
// This is the only entry point consumers should import from.
// All public types, classes, and functions are re-exported here.
// ─────────────────────────────────────────────────────────

// Client factory
export { createMediaClient } from './client/index.js';

// Types
export type {
  MediaClient,
  MediaClientConfig,
  Photo,
  PhotoSource,
  Video,
  VideoFile,
  VideoPicture,
  VideoUser,
  PaginatedResult,
  SearchOptions,
  VideoSearchOptions,
  PaginationOptions,
  Orientation,
  Size,
  Locale,
  MediaEventMap,
  MediaEventName,
  ViewEvent,
  DownloadEvent,
} from './types/index.js';

// Errors
export {
  MediaError,
  AuthenticationError,
  ApiError,
  NetworkError,
  ValidationError,
  NotFoundError,
  RateLimitError,
} from './errors/index.js';

export type { MediaErrorDetails } from './errors/index.js';
