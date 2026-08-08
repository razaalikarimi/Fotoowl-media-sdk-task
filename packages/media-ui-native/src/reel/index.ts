// ─────────────────────────────────────────────────────────
// media-ui-native — Headless Reel hook for React Native
// ─────────────────────────────────────────────────────────
//
// Designed for use with FlatList + pagingEnabled or
// a similar vertical scroll view in React Native.
//
// Limitation: Not tested in a React Native runtime.
// NO imports from media-core, media-native, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';

// ─── Configuration ───

export interface UseMediaReelConfig<T> {
  items: readonly T[];
  onActiveChange?: (item: T, index: number) => void;
  onItemVisible?: (item: T, index: number) => void;
  getItemKey: (item: T, index: number) => string;
  /** Height of each reel item for viewability calculation */
  itemHeight?: number;
}

// ─── Return Type ───

export interface UseMediaReelReturn<T> {
  activeIndex: number;
  activeItem: T | null;
  data: readonly T[];
  keyExtractor: (item: T, index: number) => string;
  /** onViewableItemsChanged config for FlatList */
  viewabilityConfig: { itemVisiblePercentThreshold: number };
  /** onViewableItemsChanged handler for FlatList */
  onViewableItemsChanged: (info: {
    viewableItems: Array<{ index: number | null; item: T }>;
  }) => void;
}

// ─── Hook ───

export function useMediaReel<T>(config: UseMediaReelConfig<T>): UseMediaReelReturn<T> {
  const { items, onActiveChange, getItemKey } = config;

  const [activeIndex, setActiveIndex] = useState(0);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: Array<{ index: number | null; item: T }> }) => {
      const firstVisible = info.viewableItems[0];
      if (firstVisible && firstVisible.index !== null) {
        setActiveIndex((prev) => {
          if (prev !== firstVisible.index) {
            onActiveChangeRef.current?.(firstVisible.item, firstVisible.index!);
            return firstVisible.index!;
          }
          return prev;
        });
      }
    },
    [],
  );

  const activeItem = activeIndex >= 0 && activeIndex < items.length
    ? items[activeIndex] ?? null
    : null;

  return {
    activeIndex,
    activeItem,
    data: items,
    keyExtractor: getItemKey,
    viewabilityConfig: { itemVisiblePercentThreshold: 50 },
    onViewableItemsChanged,
  };
}
