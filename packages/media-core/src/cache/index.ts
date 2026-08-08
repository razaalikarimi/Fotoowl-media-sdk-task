// ─────────────────────────────────────────────────────────
// media-core cache — In-memory TTL cache + request dedup
// ─────────────────────────────────────────────────────────
//
// Design decisions:
// - Simple Map-based TTL cache (not LRU — assignment says "basic")
// - Request deduplication: if the same request is in-flight, reuse the Promise
// - Cache key: deterministic string from endpoint + params
// - No external dependencies
// - Configurable TTL, defaults to 5 minutes
//
// Limitations:
// - In-memory only — cleared on page reload
// - No max-size limit (acceptable for typical search session)
// - No persistence (localStorage/IndexedDB would be overengineering)
// ─────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * A simple in-memory cache with TTL expiration and request deduplication.
 *
 * Cache key strategy: `${method}:${url}` — deterministic, simple, debuggable.
 *
 * @example
 * ```ts
 * const cache = new RequestCache(60_000); // 1 minute TTL
 *
 * // First call: fetches from network
 * const result = await cache.getOrFetch('search:nature', () => fetchFromApi());
 *
 * // Second call within TTL: returns cached
 * const cached = await cache.getOrFetch('search:nature', () => fetchFromApi());
 *
 * // Concurrent calls: single network request, shared Promise
 * const [a, b] = await Promise.all([
 *   cache.getOrFetch('search:nature', () => fetchFromApi()),
 *   cache.getOrFetch('search:nature', () => fetchFromApi()),
 * ]);
 * ```
 */
export class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, Promise<unknown>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  /**
   * Get a cached result or fetch it. Deduplicates concurrent requests.
   *
   * @param key - Cache key (e.g., 'search:nature?page=1&perPage=15')
   * @param fetcher - Function that performs the actual fetch
   * @returns The cached or freshly fetched data
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 1. Check cache
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // 2. Check if a request for this key is already in-flight
    const existing = this.pending.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // 3. Execute the fetcher and deduplicate
    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .finally(() => {
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  /** Read from cache, returning undefined if expired or missing */
  private get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  /** Write to cache with TTL */
  private set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /** Clear all cached data and pending requests */
  clear(): void {
    this.cache.clear();
    // Note: pending promises will still resolve, but won't be cached
    this.pending.clear();
  }

  /** Get the number of cached entries (useful for testing) */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Build a deterministic cache key from an endpoint and params.
 */
export function buildCacheKey(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return endpoint;
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${endpoint}?${sorted}` : endpoint;
}
