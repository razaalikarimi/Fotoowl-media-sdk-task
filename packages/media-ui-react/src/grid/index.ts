// ─────────────────────────────────────────────────────────
// media-ui-react — Headless Grid hook
// ─────────────────────────────────────────────────────────
//
// Provides behavior and accessibility primitives for a
// media grid with infinite scroll / load-more support.
//
// The consumer controls ALL markup and CSS.
// This hook provides prop-getter functions that return
// props to be spread onto elements.
//
// NO imports from media-core, media-react, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback, useRef, useEffect } from 'react';
import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

// ─── Configuration ───

export interface UseMediaGridConfig<T> {
  /** Array of items to display in the grid */
  items: readonly T[];
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Called when more items should be loaded */
  onLoadMore?: () => void;
  /** Called when an item is clicked */
  onItemClick?: (item: T, index: number) => void;
  /** Whether the grid is currently loading */
  isLoading?: boolean;
  /** Unique key extractor for items */
  getItemKey: (item: T, index: number) => string | number;
  /**
   * Use IntersectionObserver for automatic load-more.
   * When enabled, `getLoadMoreTriggerProps` returns props for a
   * sentinel element that triggers loading when visible.
   * @default true
   */
  useIntersectionObserver?: boolean;
}

// ─── Return Type ───

export interface UseMediaGridReturn<T> {
  /** Spread onto the grid container element */
  getGridProps: () => HTMLAttributes<HTMLElement>;
  /** Spread onto each grid item element */
  getItemProps: (
    item: T,
    index: number,
  ) => HTMLAttributes<HTMLElement> & { key: string | number };
  /** Spread onto the "load more" button */
  getLoadMoreButtonProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
  /** Spread onto a sentinel element for IntersectionObserver-based auto-load */
  getLoadMoreTriggerProps: () => HTMLAttributes<HTMLElement> & {
    ref: (node: HTMLElement | null) => void;
  };
  /** The items array (passthrough for convenience) */
  items: readonly T[];
  /** Whether items are loading */
  isLoading: boolean;
  /** Whether the list is empty and not loading */
  isEmpty: boolean;
  /** Whether there are more items */
  hasMore: boolean;
}

// ─── Hook ───

/**
 * Headless grid hook providing behavior + accessibility for media grids.
 *
 * @example
 * ```tsx
 * const { getGridProps, getItemProps, getLoadMoreTriggerProps, isEmpty, isLoading } =
 *   useMediaGrid({
 *     items: photos,
 *     hasMore,
 *     onLoadMore: loadMore,
 *     onItemClick: (photo) => openLightbox(photo),
 *     getItemKey: (photo) => photo.id,
 *   });
 *
 * return (
 *   <div {...getGridProps()} className="my-grid">
 *     {items.map((item, i) => (
 *       <div {...getItemProps(item, i)} className="my-grid-item">
 *         <img src={item.src} alt={item.alt} />
 *       </div>
 *     ))}
 *     <div {...getLoadMoreTriggerProps()} />
 *     {isLoading && <Spinner />}
 *   </div>
 * );
 * ```
 */
export function useMediaGrid<T>(config: UseMediaGridConfig<T>): UseMediaGridReturn<T> {
  const {
    items,
    hasMore,
    onLoadMore,
    onItemClick,
    isLoading = false,
    getItemKey,
    useIntersectionObserver: useIO = true,
  } = config;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Set up IntersectionObserver for infinite scroll
  const setSentinelNode = useCallback(
    (node: HTMLElement | null) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      sentinelRef.current = node;

      if (!node || !useIO || !hasMore || isLoading) return;

      // Only use IO if available (browser environment)
      if (typeof IntersectionObserver === 'undefined') return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting && onLoadMoreRef.current) {
            onLoadMoreRef.current();
          }
        },
        { rootMargin: '200px' },
      );

      observerRef.current.observe(node);
    },
    [useIO, hasMore, isLoading],
  );

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const getGridProps = useCallback(
    (): HTMLAttributes<HTMLElement> => ({
      role: 'list',
      'aria-label': 'Media grid',
      'aria-busy': isLoading,
    }),
    [isLoading],
  );

  const getItemProps = useCallback(
    (
      item: T,
      index: number,
    ): HTMLAttributes<HTMLElement> & { key: string | number } => ({
      key: getItemKey(item, index),
      role: 'listitem',
      tabIndex: 0,
      onClick: () => onItemClick?.(item, index),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onItemClick?.(item, index);
        }
      },
      style: { cursor: onItemClick ? 'pointer' : undefined },
    }),
    [onItemClick, getItemKey],
  );

  const getLoadMoreButtonProps = useCallback(
    (): ButtonHTMLAttributes<HTMLButtonElement> => ({
      onClick: () => onLoadMore?.(),
      disabled: isLoading || !hasMore,
      'aria-label': isLoading ? 'Loading more items' : 'Load more items',
      type: 'button' as const,
    }),
    [onLoadMore, isLoading, hasMore],
  );

  const getLoadMoreTriggerProps = useCallback(
    (): HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void } => ({
      ref: setSentinelNode,
      'aria-hidden': true,
      style: { height: 1, width: '100%' },
    }),
    [setSentinelNode],
  );

  return {
    getGridProps,
    getItemProps,
    getLoadMoreButtonProps,
    getLoadMoreTriggerProps,
    items,
    isLoading,
    isEmpty: items.length === 0 && !isLoading,
    hasMore,
  };
}
