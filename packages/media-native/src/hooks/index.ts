// ─────────────────────────────────────────────────────────
// media-native — React Native hooks for media-core
// ─────────────────────────────────────────────────────────
//
// These hooks mirror the media-react hooks but:
// - Use MediaNativeContext instead of MediaContext
// - Avoid DOM-specific APIs
// - Are designed for React Native lifecycle
//
// Limitation: Not tested in a real React Native runtime.
// The implementation is structurally valid and type-correct.
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
import { MediaNativeContext } from '../context/index.js';

// ─── useMediaClient ───

export function useMediaClient(): MediaClient {
  const client = useContext(MediaNativeContext);
  if (!client) {
    throw new Error(
      'useMediaClient must be used within a <MediaNativeProvider>.',
    );
  }
  return client;
}

// ─── Shared async state ───

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// ─── useMediaSearch ───

export function useMediaSearch(
  query: string,
  options?: SearchOptions,
) {
  const client = useMediaClient();
  const [state, setState] = useState<AsyncState<PaginatedResult<Photo>>>({
    data: null,
    loading: false,
    error: null,
  });
  const [allItems, setAllItems] = useState<readonly Photo[]>([]);
  const pageRef = useRef(1);

  const optionsKey = JSON.stringify(options ?? {});

  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null });
      setAllItems([]);
      pageRef.current = 1;
      return;
    }

    pageRef.current = 1;
    setState({ data: null, loading: true, error: null });
    setAllItems([]);

    client
      .search(query, { ...options, page: 1 })
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

export function useMediaSearchVideos(
  query: string,
  options?: VideoSearchOptions,
) {
  const client = useMediaClient();
  const [state, setState] = useState<AsyncState<PaginatedResult<Video>>>({
    data: null,
    loading: false,
    error: null,
  });
  const [allItems, setAllItems] = useState<readonly Video[]>([]);
  const pageRef = useRef(1);

  const optionsKey = JSON.stringify(options ?? {});

  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null });
      setAllItems([]);
      pageRef.current = 1;
      return;
    }

    pageRef.current = 1;
    setState({ data: null, loading: true, error: null });
    setAllItems([]);

    client
      .searchVideos(query, { ...options, page: 1 })
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

export function useMediaCurated(options?: PaginationOptions) {
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

export function useMediaItem<T extends 'photo' | 'video'>(
  type: T,
  id: number | null,
) {
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

export function useMediaEvents<E extends MediaEventName>(
  event: E,
  handler: (payload: MediaEventMap[E]) => void,
): void {
  const client = useMediaClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = client.on(event, (payload) => {
      handlerRef.current(payload);
    });
    return unsubscribe;
  }, [client, event]);
}
