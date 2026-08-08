// ─────────────────────────────────────────────────────────
// media-react — React hooks for media-core
// ─────────────────────────────────────────────────────────
//
// These hooks adapt media-core to React idioms:
// - loading/error state management
// - cleanup on unmount
// - race-condition prevention via AbortController
// - stable callback references
//
// They contain NO business logic — all actual API work
// is delegated to the MediaClient from media-core.
// ─────────────────────────────────────────────────────────

import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import type {
  MediaClient,
  MediaEventMap,
  MediaEventName,
  PaginatedResult,
  PaginationOptions,
  Photo,
  SearchOptions,
  Video,
  VideoSearchOptions,
} from '@media-sdk/media-core';
import { MediaContext } from '../context/index.js';

// ─── useMediaClient ───

/**
 * Access the MediaClient from context.
 * Throws if used outside of a MediaProvider.
 */
export function useMediaClient(): MediaClient {
  const client = useContext(MediaContext);
  if (!client) {
    throw new Error(
      'useMediaClient must be used within a <MediaProvider>. ' +
        'Wrap your app with <MediaProvider client={client}>.',
    );
  }
  return client;
}

// ─── Shared async state type ───

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// ─── useMediaSearch ───

interface UseMediaSearchResult {
  data: readonly Photo[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  totalResults: number | undefined;
}

/**
 * Search for photos. Automatically fetches when query changes.
 * Supports incremental load-more (pagination).
 *
 * @param query - Search query string. Empty string skips the search.
 * @param options - Optional search options (orientation, size, etc.)
 */
export function useMediaSearch(
  query: string,
  options?: SearchOptions,
): UseMediaSearchResult {
  const client = useMediaClient();
  const [state, setState] = useState<AsyncState<PaginatedResult<Photo>>>({
    data: null,
    loading: false,
    error: null,
  });
  const [allItems, setAllItems] = useState<readonly Photo[]>([]);
  const pageRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  // Serialize options to detect changes (shallow comparison)
  const optionsKey = JSON.stringify(options ?? {});

  // Initial search and reset on query/options change
  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null });
      setAllItems([]);
      pageRef.current = 1;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    pageRef.current = 1;
    setState({ data: null, loading: true, error: null });
    setAllItems([]);

    client
      .search(query, { ...options, page: 1 })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ data: result, loading: false, error: null });
        setAllItems(result.items);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, query, optionsKey]);

  const loadMore = useCallback(() => {
    if (state.loading || !state.data?.hasNextPage) return;

    const nextPage = (state.data.nextPage ?? pageRef.current + 1);
    pageRef.current = nextPage;

    setState((prev) => ({ ...prev, loading: true }));

    client
      .search(query, { ...options, page: nextPage })
      .then((result) => {
        setState({ data: result, loading: false, error: null });
        setAllItems((prev) => [...prev, ...result.items]);
      })
      .catch((err: unknown) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, query, optionsKey, state.loading, state.data?.hasNextPage, state.data?.nextPage]);

  return {
    data: allItems,
    loading: state.loading,
    error: state.error,
    hasMore: state.data?.hasNextPage ?? false,
    loadMore,
    totalResults: state.data?.totalResults,
  };
}

// ─── useMediaSearchVideos ───

interface UseMediaSearchVideosResult {
  data: readonly Video[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  totalResults: number | undefined;
}

/**
 * Search for videos. Same contract as useMediaSearch but for videos.
 */
export function useMediaSearchVideos(
  query: string,
  options?: VideoSearchOptions,
): UseMediaSearchVideosResult {
  const client = useMediaClient();
  const [state, setState] = useState<AsyncState<PaginatedResult<Video>>>({
    data: null,
    loading: false,
    error: null,
  });
  const [allItems, setAllItems] = useState<readonly Video[]>([]);
  const pageRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const optionsKey = JSON.stringify(options ?? {});

  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null });
      setAllItems([]);
      pageRef.current = 1;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    pageRef.current = 1;
    setState({ data: null, loading: true, error: null });
    setAllItems([]);

    client
      .searchVideos(query, { ...options, page: 1 })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ data: result, loading: false, error: null });
        setAllItems(result.items);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, query, optionsKey]);

  const loadMore = useCallback(() => {
    if (state.loading || !state.data?.hasNextPage) return;

    const nextPage = (state.data.nextPage ?? pageRef.current + 1);
    pageRef.current = nextPage;
    setState((prev) => ({ ...prev, loading: true }));

    client
      .searchVideos(query, { ...options, page: nextPage })
      .then((result) => {
        setState({ data: result, loading: false, error: null });
        setAllItems((prev) => [...prev, ...result.items]);
      })
      .catch((err: unknown) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, query, optionsKey, state.loading, state.data?.hasNextPage, state.data?.nextPage]);

  return {
    data: allItems,
    loading: state.loading,
    error: state.error,
    hasMore: state.data?.hasNextPage ?? false,
    loadMore,
    totalResults: state.data?.totalResults,
  };
}

// ─── useMediaCurated ───

interface UseMediaCuratedResult {
  data: readonly Photo[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Fetch curated photos with pagination support.
 */
export function useMediaCurated(options?: PaginationOptions): UseMediaCuratedResult {
  const client = useMediaClient();
  const [state, setState] = useState<AsyncState<PaginatedResult<Photo>>>({
    data: null,
    loading: true,
    error: null,
  });
  const [allItems, setAllItems] = useState<readonly Photo[]>([]);
  const pageRef = useRef(1);

  useEffect(() => {
    client
      .getCurated({ ...options, page: 1 })
      .then((result) => {
        setState({ data: result, loading: false, error: null });
        setAllItems(result.items);
      })
      .catch((err: unknown) => {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const loadMore = useCallback(() => {
    if (state.loading || !state.data?.hasNextPage) return;

    const nextPage = (state.data.nextPage ?? pageRef.current + 1);
    pageRef.current = nextPage;
    setState((prev) => ({ ...prev, loading: true }));

    client
      .getCurated({ ...options, page: nextPage })
      .then((result) => {
        setState({ data: result, loading: false, error: null });
        setAllItems((prev) => [...prev, ...result.items]);
      })
      .catch((err: unknown) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, state.loading, state.data?.hasNextPage, state.data?.nextPage]);

  return {
    data: allItems,
    loading: state.loading,
    error: state.error,
    hasMore: state.data?.hasNextPage ?? false,
    loadMore,
  };
}

// ─── useMediaItem ───

interface UseMediaItemResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch a single photo or video by ID.
 */
export function useMediaItem<T extends 'photo' | 'video'>(
  type: T,
  id: number | null,
): UseMediaItemResult<T extends 'photo' ? Photo : Video> {
  const client = useMediaClient();
  type ResultType = T extends 'photo' ? Photo : Video;
  const [state, setState] = useState<AsyncState<ResultType>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (id === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState({ data: null, loading: true, error: null });

    const promise =
      type === 'photo'
        ? (client.getPhoto(id) as Promise<ResultType>)
        : (client.getVideo(id) as Promise<ResultType>);

    promise
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
  }, [client, type, id]);

  return state;
}

// ─── useMediaEvents ───

/**
 * Subscribe to a media SDK event. Automatically cleans up on unmount.
 *
 * @example
 * ```tsx
 * useMediaEvents('view', (event) => {
 *   analytics.track('media_view', event);
 * });
 * ```
 */
export function useMediaEvents<E extends MediaEventName>(
  event: E,
  handler: (payload: MediaEventMap[E]) => void,
): void {
  const client = useMediaClient();
  // Use a ref so the handler can change without re-subscribing
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = client.on(event, (payload) => {
      handlerRef.current(payload);
    });
    return unsubscribe;
  }, [client, event]);
}
