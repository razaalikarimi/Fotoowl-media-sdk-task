// ─────────────────────────────────────────────────────────
// media-ui-native — Headless Lightbox hook for React Native
// ─────────────────────────────────────────────────────────
//
// Provides open/close state and navigation for a lightbox.
// Uses React state instead of DOM APIs.
//
// Limitation: Not tested in a React Native runtime.
// NO imports from media-core, media-native, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';

// ─── Configuration ───

export interface UseMediaLightboxConfig<T> {
  items: readonly T[];
  onClose?: () => void;
  onChange?: (item: T, index: number) => void;
  onDownload?: (item: T, index: number) => void;
  getItemKey: (item: T, index: number) => string | number;
}

// ─── Return Type ───

export interface UseMediaLightboxReturn<T> {
  isOpen: boolean;
  currentItem: T | null;
  currentIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  open: (item: T, index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

// ─── Hook ───

export function useMediaLightbox<T>(
  config: UseMediaLightboxConfig<T>,
): UseMediaLightboxReturn<T> {
  const { items, onClose, onChange } = config;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const onCloseRef = useRef(onClose);
  const onChangeRef = useRef(onChange);
  onCloseRef.current = onClose;
  onChangeRef.current = onChange;

  const currentItem = currentIndex >= 0 && currentIndex < items.length
    ? items[currentIndex] ?? null
    : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const open = useCallback((_item: T, index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    const item = items[index];
    if (item) onChangeRef.current?.(item, index);
  }, [items]);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentIndex(-1);
    onCloseRef.current?.();
  }, []);

  const next = useCallback(() => {
    if (!hasNext) return;
    const newIndex = currentIndex + 1;
    const newItem = items[newIndex];
    if (newItem) {
      setCurrentIndex(newIndex);
      onChangeRef.current?.(newItem, newIndex);
    }
  }, [currentIndex, hasNext, items]);

  const prev = useCallback(() => {
    if (!hasPrev) return;
    const newIndex = currentIndex - 1;
    const newItem = items[newIndex];
    if (newItem) {
      setCurrentIndex(newIndex);
      onChangeRef.current?.(newItem, newIndex);
    }
  }, [currentIndex, hasPrev, items]);

  return {
    isOpen, currentItem, currentIndex,
    hasPrev, hasNext, open, close, next, prev,
  };
}
