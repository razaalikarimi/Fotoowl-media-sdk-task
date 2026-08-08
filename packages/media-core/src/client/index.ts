// ─────────────────────────────────────────────────────────
// media-core client — MediaClient factory
// ─────────────────────────────────────────────────────────

import {
  DEFAULT_BASE_URL,
  getCuratedPhotos,
  getPhotoById,
  getPopularVideos,
  getVideoById,
  searchPhotos,
  searchVideos,
  type PexelsApiOptions,
} from '../api/index.js';
import { validateApiKey } from '../auth/index.js';
import { buildCacheKey, RequestCache } from '../cache/index.js';
import { ValidationError } from '../errors/index.js';
import { MediaEventEmitter } from '../events/index.js';
import type {
  MediaClient,
  MediaClientConfig,
  MediaEventMap,
  MediaEventName,
  PaginatedResult,
  PaginationOptions,
  Photo,
  SearchOptions,
  Video,
  VideoSearchOptions,
} from '../types/index.js';

/**
 * Create a new MediaClient instance.
 *
 * The client is the primary entry point for the SDK.
 * It provides methods for searching/fetching media, an event
 * system for tracking activity, and request caching/dedup.
 *
 * @example
 * ```ts
 * const client = createMediaClient({
 *   apiKey: 'your-pexels-api-key',
 *   cacheTtlMs: 60_000, // optional, defaults to 5 minutes
 * });
 *
 * const results = await client.search('nature');
 * console.log(results.items); // Photo[]
 *
 * // Subscribe to events
 * const unsub = client.on('view', (event) => {
 *   console.log('Photo viewed:', event.mediaId);
 * });
 *
 * // Emit events
 * client.emit('view', {
 *   mediaId: 123,
 *   mediaType: 'photo',
 *   timestamp: Date.now(),
 * });
 *
 * // Clean up
 * unsub();
 * client.destroy();
 * ```
 */
export function createMediaClient(config: MediaClientConfig): MediaClient {
  const apiKey = validateApiKey(config.apiKey);
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const cache = new RequestCache(config.cacheTtlMs);
  const emitter = new MediaEventEmitter();

  const apiOptions: PexelsApiOptions = { apiKey, baseUrl };

  const client: MediaClient = {
    // ─── Photo API ───

    async search(
      query: string,
      options?: SearchOptions,
    ): Promise<PaginatedResult<Photo>> {
      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query must not be empty');
      }
      const key = buildCacheKey('search:photos', {
        query: query.trim(),
        page: options?.page,
        perPage: options?.perPage,
        orientation: options?.orientation,
        size: options?.size,
        locale: options?.locale,
        color: options?.color,
      });
      return cache.getOrFetch(key, () => searchPhotos(query.trim(), options, apiOptions));
    },

    async getCurated(options?: PaginationOptions): Promise<PaginatedResult<Photo>> {
      const key = buildCacheKey('curated', {
        page: options?.page,
        perPage: options?.perPage,
      });
      return cache.getOrFetch(key, () => getCuratedPhotos(options, apiOptions));
    },

    async getPhoto(id: number): Promise<Photo> {
      if (!Number.isFinite(id) || id <= 0) {
        throw new ValidationError(`Invalid photo ID: ${id}`);
      }
      const key = `photo:${id}`;
      return cache.getOrFetch(key, () => getPhotoById(id, apiOptions));
    },

    // ─── Video API ───

    async searchVideos(
      query: string,
      options?: VideoSearchOptions,
    ): Promise<PaginatedResult<Video>> {
      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query must not be empty');
      }
      const key = buildCacheKey('search:videos', {
        query: query.trim(),
        page: options?.page,
        perPage: options?.perPage,
        orientation: options?.orientation,
        size: options?.size,
        locale: options?.locale,
      });
      return cache.getOrFetch(key, () =>
        searchVideos(query.trim(), options, apiOptions),
      );
    },

    async getPopularVideos(options?: PaginationOptions): Promise<PaginatedResult<Video>> {
      const key = buildCacheKey('popular:videos', {
        page: options?.page,
        perPage: options?.perPage,
      });
      return cache.getOrFetch(key, () => getPopularVideos(options, apiOptions));
    },

    async getVideo(id: number): Promise<Video> {
      if (!Number.isFinite(id) || id <= 0) {
        throw new ValidationError(`Invalid video ID: ${id}`);
      }
      const key = `video:${id}`;
      return cache.getOrFetch(key, () => getVideoById(id, apiOptions));
    },

    // ─── Events ───

    on<E extends MediaEventName>(
      event: E,
      listener: (payload: MediaEventMap[E]) => void,
    ): () => void {
      return emitter.on(event, listener);
    },

    emit<E extends MediaEventName>(event: E, payload: MediaEventMap[E]): void {
      emitter.emit(event, payload);
    },

    // ─── Cache Management ───

    clearCache(): void {
      cache.clear();
    },

    // ─── Lifecycle ───

    destroy(): void {
      emitter.destroy();
      cache.clear();
    },
  };

  return client;
}
