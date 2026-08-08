// ─────────────────────────────────────────────────────────
// media-core tests — Client
// ─────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMediaClient } from '../src/client/index.js';
import { AuthenticationError, ValidationError } from '../src/errors/index.js';
import type { MediaClient } from '../src/types/index.js';

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('createMediaClient', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw AuthenticationError for missing API key', () => {
    expect(() => createMediaClient({ apiKey: '' })).toThrow(AuthenticationError);
  });

  it('should create a client with valid API key', () => {
    const client = createMediaClient({ apiKey: 'test-key' });
    expect(client).toBeDefined();
    expect(client.search).toBeTypeOf('function');
    expect(client.getCurated).toBeTypeOf('function');
    expect(client.getPhoto).toBeTypeOf('function');
    expect(client.on).toBeTypeOf('function');
    expect(client.emit).toBeTypeOf('function');
    expect(client.clearCache).toBeTypeOf('function');
    expect(client.destroy).toBeTypeOf('function');
    client.destroy();
  });

  describe('search', () => {
    let client: MediaClient;

    beforeEach(() => {
      client = createMediaClient({ apiKey: 'test-key' });
    });

    afterEach(() => {
      client.destroy();
    });

    it('should throw ValidationError for empty query', async () => {
      await expect(client.search('')).rejects.toThrow(ValidationError);
      await expect(client.search('  ')).rejects.toThrow(ValidationError);
    });

    it('should make a search request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          photos: [],
          page: 1,
          per_page: 15,
          total_results: 0,
          next_page: undefined,
        }),
      });

      const result = await client.search('nature');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('https://api.pexels.com/v1/search');
      expect(url).toContain('query=nature');
      expect(result.items).toEqual([]);
      expect(result.page).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should pass authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          photos: [],
          page: 1,
          per_page: 15,
          total_results: 0,
        }),
      });

      await client.search('nature');

      const options = mockFetch.mock.calls[0]?.[1] as RequestInit;
      expect(options.headers).toMatchObject({ Authorization: 'test-key' });
    });

    it('should cache identical requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          photos: [],
          page: 1,
          per_page: 15,
          total_results: 0,
        }),
      });

      await client.search('nature');
      await client.search('nature');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not cache different queries', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          photos: [],
          page: 1,
          per_page: 15,
          total_results: 0,
        }),
      });

      await client.search('nature');
      await client.search('cats');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPhoto', () => {
    let client: MediaClient;

    beforeEach(() => {
      client = createMediaClient({ apiKey: 'test-key' });
    });

    afterEach(() => {
      client.destroy();
    });

    it('should throw ValidationError for invalid ID', async () => {
      await expect(client.getPhoto(0)).rejects.toThrow(ValidationError);
      await expect(client.getPhoto(-1)).rejects.toThrow(ValidationError);
      await expect(client.getPhoto(NaN)).rejects.toThrow(ValidationError);
    });

    it('should fetch a photo by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 123,
          width: 1920,
          height: 1080,
          url: 'https://pexels.com/photo/123',
          photographer: 'Test',
          photographer_url: 'https://pexels.com/@test',
          photographer_id: 1,
          avg_color: '#333',
          src: {
            original: 'url',
            large2x: 'url',
            large: 'url',
            medium: 'url',
            small: 'url',
            portrait: 'url',
            landscape: 'url',
            tiny: 'url',
          },
          liked: false,
          alt: 'Test photo',
        }),
      });

      const photo = await client.getPhoto(123);

      expect(photo.id).toBe(123);
      expect(photo.photographer).toBe('Test');
      expect(photo.photographerUrl).toBe('https://pexels.com/@test');
    });
  });

  describe('events', () => {
    it('should subscribe and receive events', () => {
      const client = createMediaClient({ apiKey: 'test-key' });
      const listener = vi.fn();

      client.on('view', listener);
      client.emit('view', {
        mediaId: 1,
        mediaType: 'photo',
        timestamp: Date.now(),
      });

      expect(listener).toHaveBeenCalledOnce();
      client.destroy();
    });

    it('should unsubscribe cleanly', () => {
      const client = createMediaClient({ apiKey: 'test-key' });
      const listener = vi.fn();

      const unsub = client.on('view', listener);
      unsub();

      client.emit('view', {
        mediaId: 1,
        mediaType: 'photo',
        timestamp: Date.now(),
      });

      // Listener should not be called (default listener logs, but custom one is removed)
      expect(listener).not.toHaveBeenCalled();
      client.destroy();
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const client = createMediaClient({ apiKey: 'test-key' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          photos: [],
          page: 1,
          per_page: 15,
          total_results: 0,
        }),
      });

      await client.search('test');
      client.clearCache();
      await client.search('test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      client.destroy();
    });
  });
});
