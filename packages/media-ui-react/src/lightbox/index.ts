// ─────────────────────────────────────────────────────────
// media-ui-react — Headless Lightbox hook
// ─────────────────────────────────────────────────────────
//
// Provides open/close state, prev/next navigation,
// keyboard handling, focus management, and accessible
// prop-getters for building a lightbox UI.
//
// NO imports from media-core, media-react, or any SDK.
// ─────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

// ─── Configuration ───

export interface UseMediaLightboxConfig<T> {
  /** All items available in the lightbox */
  items: readonly T[];
  /** Called when the lightbox closes */
  onClose?: () => void;
  /** Called when the active item changes */
  onChange?: (item: T, index: number) => void;
  /** Called when the user triggers a download action */
  onDownload?: (item: T, index: number) => void;
  /** Unique key extractor */
  getItemKey: (item: T, index: number) => string | number;
  /**
   * Whether to trap focus within the lightbox when open.
   * @default true
   */
  trapFocus?: boolean;
  /**
   * Whether to close on Escape key.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Whether to close on overlay click.
   * @default true
   */
  closeOnOverlayClick?: boolean;
}

// ─── Return Type ───

export interface UseMediaLightboxReturn<T> {
  /** Whether the lightbox is open */
  isOpen: boolean;
  /** The current item being displayed */
  currentItem: T | null;
  /** The current index */
  currentIndex: number;
  /** Whether there is a previous item */
  hasPrev: boolean;
  /** Whether there is a next item */
  hasNext: boolean;
  /** Open the lightbox at a specific item */
  open: (item: T, index: number) => void;
  /** Close the lightbox */
  close: () => void;
  /** Navigate to the next item */
  next: () => void;
  /** Navigate to the previous item */
  prev: () => void;
  /** Spread onto the lightbox overlay/backdrop element */
  getOverlayProps: () => HTMLAttributes<HTMLElement>;
  /** Spread onto the lightbox content container */
  getContentProps: () => HTMLAttributes<HTMLElement> & {
    ref: (node: HTMLElement | null) => void;
  };
  /** Spread onto the close button */
  getCloseButtonProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
  /** Spread onto the previous button */
  getPrevButtonProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
  /** Spread onto the next button */
  getNextButtonProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
  /** Spread onto the download button (optional) */
  getDownloadButtonProps: () => ButtonHTMLAttributes<HTMLButtonElement>;
}

// ─── Hook ───

/**
 * Headless lightbox hook providing behavior, keyboard navigation,
 * focus management, and accessible prop-getters.
 *
 * @example
 * ```tsx
 * const lightbox = useMediaLightbox({
 *   items: photos,
 *   onClose: () => console.log('closed'),
 *   getItemKey: (p) => p.id,
 * });
 *
 * // In grid item click handler:
 * lightbox.open(photo, index);
 *
 * // Lightbox rendering:
 * {lightbox.isOpen && (
 *   <div {...lightbox.getOverlayProps()} className="overlay">
 *     <div {...lightbox.getContentProps()} className="content">
 *       <img src={lightbox.currentItem.src} />
 *       <button {...lightbox.getCloseButtonProps()}>×</button>
 *       <button {...lightbox.getPrevButtonProps()}>←</button>
 *       <button {...lightbox.getNextButtonProps()}>→</button>
 *     </div>
 *   </div>
 * )}
 * ```
 */
export function useMediaLightbox<T>(
  config: UseMediaLightboxConfig<T>,
): UseMediaLightboxReturn<T> {
  const {
    items,
    onClose,
    onChange,
    onDownload,
    trapFocus = true,
    closeOnEscape = true,
    closeOnOverlayClick = true,
  } = config;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const contentRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  const onChangeRef = useRef(onChange);
  onCloseRef.current = onClose;
  onChangeRef.current = onChange;

  const currentItem = currentIndex >= 0 && currentIndex < items.length
    ? items[currentIndex] ?? null
    : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const open = useCallback((item: T, index: number) => {
    // Store what had focus before opening
    previousActiveElement.current = document.activeElement;
    setCurrentIndex(index);
    setIsOpen(true);
    onChangeRef.current?.(item, index);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentIndex(-1);
    onCloseRef.current?.();
    // Restore focus to the element that had it before
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
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

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (closeOnEscape) {
            e.preventDefault();
            close();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, next, prev, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    const handleFocusTrap = (e: FocusEvent) => {
      if (
        contentRef.current &&
        e.target instanceof Node &&
        !contentRef.current.contains(e.target)
      ) {
        contentRef.current.focus();
      }
    };

    document.addEventListener('focusin', handleFocusTrap);
    return () => document.removeEventListener('focusin', handleFocusTrap);
  }, [isOpen, trapFocus]);

  // Focus the content when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // ─── Prop Getters ───

  const getOverlayProps = useCallback(
    (): HTMLAttributes<HTMLElement> => ({
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Media lightbox',
      onClick: (e) => {
        // Only close if clicking the overlay itself, not its children
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          close();
        }
      },
    }),
    [close, closeOnOverlayClick],
  );

  const getContentProps = useCallback(
    (): HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void } => ({
      ref: (node: HTMLElement | null) => {
        contentRef.current = node;
      },
      tabIndex: -1,
      role: 'document',
      'aria-label': currentItem
        ? `Media item ${currentIndex + 1} of ${items.length}`
        : 'Lightbox content',
    }),
    [currentIndex, currentItem, items.length],
  );

  const getCloseButtonProps = useCallback(
    (): ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Close lightbox',
      onClick: close,
    }),
    [close],
  );

  const getPrevButtonProps = useCallback(
    (): ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Previous item',
      disabled: !hasPrev,
      onClick: prev,
    }),
    [hasPrev, prev],
  );

  const getNextButtonProps = useCallback(
    (): ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Next item',
      disabled: !hasNext,
      onClick: next,
    }),
    [hasNext, next],
  );

  const getDownloadButtonProps = useCallback(
    (): ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Download',
      disabled: !currentItem,
      onClick: () => {
        if (currentItem) {
          onDownload?.(currentItem, currentIndex);
        }
      },
    }),
    [currentItem, currentIndex, onDownload],
  );

  return {
    isOpen,
    currentItem,
    currentIndex,
    hasPrev,
    hasNext,
    open,
    close,
    next,
    prev,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    getPrevButtonProps,
    getNextButtonProps,
    getDownloadButtonProps,
  };
}
