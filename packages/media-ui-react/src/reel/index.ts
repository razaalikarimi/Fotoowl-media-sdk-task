// ─────────────────────────────────────────────────────────
// media-ui-react — Headless Reel Swiper hook
// ─────────────────────────────────────────────────────────
//
// Provides vertical snap-paging behavior with active item
// detection using IntersectionObserver. Designed for
// TikTok/Instagram Reels-style vertical scroll UIs.
//
// NO imports from media-core, media-react, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, CSSProperties } from 'react';

// ─── Configuration ───

export interface UseMediaReelConfig<T> {
  /** Items to display in the reel */
  items: readonly T[];
  /** Called when the active item changes */
  onActiveChange?: (item: T, index: number) => void;
  /** Called when an item enters the viewport */
  onItemVisible?: (item: T, index: number) => void;
  /** Unique key extractor */
  getItemKey: (item: T, index: number) => string | number;
  /**
   * IntersectionObserver threshold for considering an item "active".
   * @default 0.5
   */
  activeThreshold?: number;
}

// ─── Return Type ───

export interface UseMediaReelReturn<T> {
  /** Index of the currently active (most visible) item */
  activeIndex: number;
  /** The currently active item */
  activeItem: T | null;
  /** Spread onto the reel scroll container */
  getReelContainerProps: () => HTMLAttributes<HTMLElement> & {
    ref: (node: HTMLElement | null) => void;
    style: CSSProperties;
  };
  /** Spread onto each reel item wrapper */
  getReelItemProps: (
    item: T,
    index: number,
  ) => HTMLAttributes<HTMLElement> & {
    key: string | number;
    ref: (node: HTMLElement | null) => void;
    style: CSSProperties;
  };
  /** Scroll to a specific item programmatically */
  scrollToIndex: (index: number) => void;
  /** The items array (passthrough) */
  items: readonly T[];
}

// ─── Hook ───

/**
 * Headless reel/swiper hook for vertical snap-paging media UIs.
 *
 * Uses CSS scroll-snap for smooth native paging and
 * IntersectionObserver for active-item detection.
 *
 * @example
 * ```tsx
 * const reel = useMediaReel({
 *   items: videos,
 *   onActiveChange: (video) => playVideo(video.id),
 *   getItemKey: (v) => v.id,
 * });
 *
 * return (
 *   <div {...reel.getReelContainerProps()} className="my-reel">
 *     {videos.map((video, i) => (
 *       <div {...reel.getReelItemProps(video, i)} className="my-reel-item">
 *         <video src={video.url} />
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMediaReel<T>(config: UseMediaReelConfig<T>): UseMediaReelReturn<T> {
  const {
    items,
    onActiveChange,
    onItemVisible,
    getItemKey,
    activeThreshold = 0.5,
  } = config;

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep callbacks in refs to avoid re-creating observer on every render
  const onActiveChangeRef = useRef(onActiveChange);
  const onItemVisibleRef = useRef(onItemVisible);
  onActiveChangeRef.current = onActiveChange;
  onItemVisibleRef.current = onItemVisible;

  // Set up IntersectionObserver for active-item detection
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    observerRef.current?.disconnect();

    const visibleEntries = new Map<number, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Look up the index from the itemRefs Map
          let index = -1;
          for (const [idx, el] of itemRefs.current) {
            if (el === entry.target) {
              index = idx;
              break;
            }
          }
          if (index === -1) continue;

          if (entry.isIntersecting) {
            visibleEntries.set(index, entry.intersectionRatio);
            const item = items[index];
            if (item) {
              onItemVisibleRef.current?.(item, index);
            }
          } else {
            visibleEntries.delete(index);
          }
        }

        // Find the most visible item
        let maxRatio = 0;
        let maxIndex = 0;
        for (const [idx, ratio] of visibleEntries) {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxIndex = idx;
          }
        }

        if (visibleEntries.size > 0) {
          setActiveIndex((prev) => {
            if (prev !== maxIndex) {
              const item = items[maxIndex];
              if (item) {
                onActiveChangeRef.current?.(item, maxIndex);
              }
              return maxIndex;
            }
            return prev;
          });
        }
      },
      {
        root: containerRef.current,
        threshold: [0, 0.25, activeThreshold, 0.75, 1],
      },
    );

    // Observe all current items
    for (const [, element] of itemRefs.current) {
      observerRef.current.observe(element);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items, activeThreshold]);

  const setItemRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (node) {
        itemRefs.current.set(index, node);
        observerRef.current?.observe(node);
      } else {
        const existing = itemRefs.current.get(index);
        if (existing) {
          observerRef.current?.unobserve(existing);
        }
        itemRefs.current.delete(index);
      }
    },
    [],
  );

  const scrollToIndex = useCallback((index: number) => {
    const element = itemRefs.current.get(index);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const getReelContainerProps = useCallback(
    (): HTMLAttributes<HTMLElement> & {
      ref: (node: HTMLElement | null) => void;
      style: CSSProperties;
    } => ({
      ref: (node: HTMLElement | null) => {
        containerRef.current = node;
      },
      role: 'feed',
      'aria-label': 'Media reel',
      style: {
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        height: '100%',
        // Hide scrollbar for cleaner look but keep scrollability
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as CSSProperties,
    }),
    [],
  );

  const getReelItemProps = useCallback(
    (
      item: T,
      index: number,
    ): HTMLAttributes<HTMLElement> & {
      key: string | number;
      ref: (node: HTMLElement | null) => void;
      style: CSSProperties;
    } => ({
      key: getItemKey(item, index),
      ref: setItemRef(index),
      role: 'article' as const,
      'aria-label': `Reel item ${index + 1} of ${items.length}`,
      'aria-current': index === activeIndex ? ('true' as const) : undefined,
      tabIndex: index === activeIndex ? 0 : -1,
      style: {
        scrollSnapAlign: 'start' as const,
        height: '100%',
        flexShrink: 0,
      },
    }),
    [getItemKey, items.length, activeIndex, setItemRef],
  );

  const activeItem = activeIndex >= 0 && activeIndex < items.length
    ? items[activeIndex] ?? null
    : null;

  return {
    activeIndex,
    activeItem,
    getReelContainerProps,
    getReelItemProps,
    scrollToIndex,
    items,
  };
}
