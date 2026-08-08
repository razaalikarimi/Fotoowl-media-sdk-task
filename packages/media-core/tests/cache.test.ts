// ─────────────────────────────────────────────────────────
// media-core tests — Cache & Request Deduplication
// ─────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestCache, buildCacheKey } from '../src/cache/index.js';

describe('RequestCache', () => {
  let cache: RequestCache;

  beforeEach(() => {
    cache = new RequestCache(1000); // 1 second TTL for tests
  });

  it('should return cached data for same key', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'hello' });

    const result1 = await cache.getOrFetch('key1', fetcher);
    const result2 = await cache.getOrFetch('key1', fetcher);

    expect(result1).toEqual({ data: 'hello' });
    expect(result2).toEqual({ data: 'hello' });
    expect(fetcher).toHaveBeenCalledTimes(1); // Only one fetch
  });

  it('should deduplicate concurrent requests', async () => {
    let resolvePromise: (value: string) => void;
    const fetcher = vi.fn().mockImplementation(
      () => new Promise<string>((resolve) => { resolvePromise = resolve; }),
    );

    const promise1 = cache.getOrFetch('key1', fetcher);
    const promise2 = cache.getOrFetch('key1', fetcher);

    resolvePromise!('result');

    const [r1, r2] = await Promise.all([promise1, promise2]);

    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(fetcher).toHaveBeenCalledTimes(1); // Single fetch despite two calls
  });

  it('should use separate entries for different keys', async () => {
    const fetcher1 = vi.fn().mockResolvedValue('a');
    const fetcher2 = vi.fn().mockResolvedValue('b');

    const r1 = await cache.getOrFetch('key1', fetcher1);
    const r2 = await cache.getOrFetch('key2', fetcher2);

    expect(r1).toBe('a');
    expect(r2).toBe('b');
    expect(fetcher1).toHaveBeenCalledTimes(1);
    expect(fetcher2).toHaveBeenCalledTimes(1);
  });

  it('should expire entries after TTL', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    await cache.getOrFetch('key1', fetcher);

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 1100));

    await cache.getOrFetch('key1', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2); // Fetched again after expiry
  });

  it('should clear all entries', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');

    await cache.getOrFetch('key1', fetcher);
    cache.clear();

    await cache.getOrFetch('key1', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(cache.size).toBe(1);
  });

  it('should report correct size', async () => {
    expect(cache.size).toBe(0);

    await cache.getOrFetch('k1', () => Promise.resolve('a'));
    expect(cache.size).toBe(1);

    await cache.getOrFetch('k2', () => Promise.resolve('b'));
    expect(cache.size).toBe(2);
  });
});

describe('buildCacheKey', () => {
  it('should return endpoint alone when no params', () => {
    expect(buildCacheKey('search')).toBe('search');
  });

  it('should sort params alphabetically', () => {
    expect(
      buildCacheKey('search', { query: 'nature', page: 1, perPage: 15 }),
    ).toBe('search?page=1&perPage=15&query=nature');
  });

  it('should filter out undefined values', () => {
    expect(
      buildCacheKey('search', { query: 'nature', color: undefined }),
    ).toBe('search?query=nature');
  });

  it('should produce deterministic keys regardless of insertion order', () => {
    const key1 = buildCacheKey('s', { b: 2, a: 1 });
    const key2 = buildCacheKey('s', { a: 1, b: 2 });
    expect(key1).toBe(key2);
  });
});
