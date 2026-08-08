// ─────────────────────────────────────────────────────────
// media-ui-react tests — Grid, Lightbox, Reel
// ─────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaGrid } from '../src/grid/index.js';
import { useMediaLightbox } from '../src/lightbox/index.js';
import { useMediaReel } from '../src/reel/index.js';

// ─── Test Items (generic — no Pexels types!) ───

interface TestItem {
  id: number;
  name: string;
}

const testItems: TestItem[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

// ─── Grid Tests ───

describe('useMediaGrid', () => {
  it('should return grid props with correct role', () => {
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: false,
        getItemKey: (item) => item.id,
      }),
    );

    const gridProps = result.current.getGridProps();
    expect(gridProps.role).toBe('list');
    expect(gridProps['aria-label']).toBe('Media grid');
  });

  it('should return item props with correct key and role', () => {
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: false,
        getItemKey: (item) => item.id,
      }),
    );

    const itemProps = result.current.getItemProps(testItems[0]!, 0);
    expect(itemProps.key).toBe(1);
    expect(itemProps.role).toBe('listitem');
    expect(itemProps.tabIndex).toBe(0);
  });

  it('should call onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: false,
        onItemClick,
        getItemKey: (item) => item.id,
      }),
    );

    const itemProps = result.current.getItemProps(testItems[0]!, 0);
    itemProps.onClick?.({} as React.MouseEvent<HTMLElement>);

    expect(onItemClick).toHaveBeenCalledWith(testItems[0], 0);
  });

  it('should report isEmpty correctly', () => {
    const { result } = renderHook(() =>
      useMediaGrid({
        items: [],
        hasMore: false,
        getItemKey: (item: TestItem) => item.id,
      }),
    );

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.items.length).toBe(0);
  });

  it('should report isEmpty as false when loading', () => {
    const { result } = renderHook(() =>
      useMediaGrid({
        items: [],
        hasMore: false,
        isLoading: true,
        getItemKey: (item: TestItem) => item.id,
      }),
    );

    expect(result.current.isEmpty).toBe(false);
  });

  it('should provide load-more button props', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: true,
        onLoadMore,
        getItemKey: (item) => item.id,
      }),
    );

    const loadMoreProps = result.current.getLoadMoreButtonProps();
    expect(loadMoreProps.disabled).toBe(false);
    expect(loadMoreProps.type).toBe('button');

    loadMoreProps.onClick?.({} as React.MouseEvent<HTMLButtonElement>);
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('should disable load-more when no more items', () => {
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: false,
        getItemKey: (item) => item.id,
      }),
    );

    const loadMoreProps = result.current.getLoadMoreButtonProps();
    expect(loadMoreProps.disabled).toBe(true);
  });

  it('should handle keyboard Enter on items', () => {
    const onItemClick = vi.fn();
    const { result } = renderHook(() =>
      useMediaGrid({
        items: testItems,
        hasMore: false,
        onItemClick,
        getItemKey: (item) => item.id,
      }),
    );

    const itemProps = result.current.getItemProps(testItems[0]!, 0);
    const preventDefault = vi.fn();
    itemProps.onKeyDown?.({ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent<HTMLElement>);

    expect(preventDefault).toHaveBeenCalled();
    expect(onItemClick).toHaveBeenCalledWith(testItems[0], 0);
  });
});

// ─── Lightbox Tests ───

describe('useMediaLightbox', () => {
  it('should start closed', () => {
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentItem).toBeNull();
    expect(result.current.currentIndex).toBe(-1);
  });

  it('should open at specified index', () => {
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    act(() => {
      result.current.open(testItems[1]!, 1);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentItem).toEqual(testItems[1]);
    expect(result.current.currentIndex).toBe(1);
  });

  it('should close', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        onClose,
        getItemKey: (item) => item.id,
      }),
    );

    act(() => {
      result.current.open(testItems[0]!, 0);
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should navigate next/prev', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        onChange,
        getItemKey: (item) => item.id,
      }),
    );

    act(() => { result.current.open(testItems[0]!, 0); });
    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(true);

    act(() => { result.current.next(); });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentItem).toEqual(testItems[1]);

    act(() => { result.current.next(); });
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.hasNext).toBe(false);

    act(() => { result.current.prev(); });
    expect(result.current.currentIndex).toBe(1);
  });

  it('should not go past boundaries', () => {
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    act(() => { result.current.open(testItems[0]!, 0); });
    act(() => { result.current.prev(); }); // Already at 0

    expect(result.current.currentIndex).toBe(0);

    act(() => { result.current.open(testItems[2]!, 2); });
    act(() => { result.current.next(); }); // Already at last

    expect(result.current.currentIndex).toBe(2);
  });

  it('should provide accessible overlay props', () => {
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    const overlayProps = result.current.getOverlayProps();
    expect(overlayProps.role).toBe('dialog');
    expect(overlayProps['aria-modal']).toBe(true);
  });

  it('should provide accessible button props', () => {
    const { result } = renderHook(() =>
      useMediaLightbox({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    const closeProps = result.current.getCloseButtonProps();
    expect(closeProps['aria-label']).toBe('Close lightbox');
    expect(closeProps.type).toBe('button');

    const prevProps = result.current.getPrevButtonProps();
    expect(prevProps['aria-label']).toBe('Previous item');

    const nextProps = result.current.getNextButtonProps();
    expect(nextProps['aria-label']).toBe('Next item');
  });
});

// ─── Reel Tests ───

describe('useMediaReel', () => {
  it('should start at index 0', () => {
    const { result } = renderHook(() =>
      useMediaReel({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    expect(result.current.activeIndex).toBe(0);
    expect(result.current.activeItem).toEqual(testItems[0]);
  });

  it('should provide container props with feed role', () => {
    const { result } = renderHook(() =>
      useMediaReel({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    const containerProps = result.current.getReelContainerProps();
    expect(containerProps.role).toBe('feed');
    expect(containerProps.style.scrollSnapType).toBe('y mandatory');
  });

  it('should provide item props with correct role and snap', () => {
    const { result } = renderHook(() =>
      useMediaReel({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    const itemProps = result.current.getReelItemProps(testItems[0]!, 0);
    expect(itemProps.key).toBe(1);
    expect(itemProps.role).toBe('article');
    expect(itemProps.style.scrollSnapAlign).toBe('start');
    expect(itemProps['aria-current']).toBe('true'); // Active item
  });

  it('should mark non-active items correctly', () => {
    const { result } = renderHook(() =>
      useMediaReel({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    const itemProps = result.current.getReelItemProps(testItems[1]!, 1);
    expect(itemProps['aria-current']).toBeUndefined();
    expect(itemProps.tabIndex).toBe(-1);
  });

  it('should expose items passthrough', () => {
    const { result } = renderHook(() =>
      useMediaReel({
        items: testItems,
        getItemKey: (item) => item.id,
      }),
    );

    expect(result.current.items).toEqual(testItems);
  });
});
