// ─────────────────────────────────────────────────────────
// media-ui-native — Headless Grid hook for React Native
// ─────────────────────────────────────────────────────────
//
// Provides behavior for a media grid in React Native.
// Uses FlatList-compatible patterns instead of DOM/IntersectionObserver.
//
// Limitation: Not tested in a real React Native runtime.
// The API contract and types are valid.
//
// NO imports from media-core, media-native, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';

// ─── Configuration ───

export interface UseMediaGridConfig<T> {
  items: readonly T[];
  hasMore: boolean;
  onLoadMore?: () => void;
  onItemPress?: (item: T, index: number) => void;
  isLoading?: boolean;
  getItemKey: (item: T, index: number) => string;
}

// ─── Return Type ───

export interface UseMediaGridReturn<T> {
  /** Data array for FlatList */
  data: readonly T[];
  /** Key extractor for FlatList */
  keyExtractor: (item: T, index: number) => string;
  /** onEndReached handler for FlatList */
  onEndReached: () => void;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether the list is empty */
  isEmpty: boolean;
  /** Create a press handler for an item */
  createItemPressHandler: (item: T, index: number) => () => void;
}

// ─── Hook ───

/**
 * Headless grid hook for React Native FlatList integration.
 *
 * @example
 * ```tsx
 * const grid = useMediaGrid({
 *   items: photos,
 *   hasMore,
 *   onLoadMore,
 *   onItemPress: (photo) => navigation.navigate('Detail', { id: photo.id }),
 *   getItemKey: (p) => String(p.id),
 * });
 *
 * <FlatList
 *   data={grid.data}
 *   keyExtractor={grid.keyExtractor}
 *   onEndReached={grid.onEndReached}
 *   onEndReachedThreshold={0.5}
 *   numColumns={2}
 *   renderItem={({ item, index }) => (
 *     <Pressable onPress={grid.createItemPressHandler(item, index)}>
 *       <Image source={{ uri: item.src }} />
 *     </Pressable>
 *   )}
 * />
 * ```
 */
export function useMediaGrid<T>(config: UseMediaGridConfig<T>): UseMediaGridReturn<T> {
  const {
    items,
    hasMore,
    onLoadMore,
    onItemPress,
    isLoading = false,
    getItemKey,
  } = config;

  const onEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      onLoadMore?.();
    }
  }, [isLoading, hasMore, onLoadMore]);

  const createItemPressHandler = useCallback(
    (item: T, index: number) => () => {
      onItemPress?.(item, index);
    },
    [onItemPress],
  );

  return {
    data: items,
    keyExtractor: getItemKey,
    onEndReached,
    isLoading,
    isEmpty: items.length === 0 && !isLoading,
    createItemPressHandler,
  };
}
