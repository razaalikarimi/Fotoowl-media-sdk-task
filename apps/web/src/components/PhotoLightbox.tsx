// ─────────────────────────────────────────────────────────
// PhotoLightbox — Composes media-ui-react's useMediaLightbox
// with Photo data. Consumer-controlled CSS.
// ─────────────────────────────────────────────────────────

import { useEffect } from 'react';
import type { Photo } from '@media-sdk/media-core';
import { useMediaLightbox } from '@media-sdk/media-ui-react';

interface PhotoLightboxProps {
  photos: readonly Photo[];
  initialIndex: number;
  onClose: () => void;
  onDownload?: (photo: Photo) => void;
  onView?: (photo: Photo) => void;
}

import { motion, AnimatePresence } from 'framer-motion';

export function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
  onDownload,
  onView,
}: PhotoLightboxProps) {
  const lightbox = useMediaLightbox({
    items: photos,
    onClose,
    onDownload: (photo) => onDownload?.(photo),
    onChange: (photo) => onView?.(photo),
    getItemKey: (photo) => photo.id,
  });

  // Open at the initial index on mount
  useEffect(() => {
    const photo = photos[initialIndex];
    if (photo) {
      lightbox.open(photo, initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {lightbox.isOpen && lightbox.currentItem && (
        <motion.div
          {...lightbox.getOverlayProps()}
          className="lightbox-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            {...lightbox.getContentProps()}
            className="lightbox-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="lightbox-header">
              <div className="lightbox-info">
                <span className="lightbox-photographer">{lightbox.currentItem.photographer}</span>
                <span className="lightbox-counter">
                  {lightbox.currentIndex + 1} / {photos.length}
                </span>
              </div>
              <div className="lightbox-actions">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  {...lightbox.getDownloadButtonProps()}
                  className="lightbox-btn"
                  title="Download"
                >
                  ↓
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  {...lightbox.getCloseButtonProps()}
                  className="lightbox-btn lightbox-btn--close"
                  title="Close"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <div className="lightbox-image-container">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                {...lightbox.getPrevButtonProps()}
                className="lightbox-nav lightbox-nav--prev"
              >
                ‹
              </motion.button>

              <motion.img
                key={`img-${lightbox.currentItem.id}`}
                src={lightbox.currentItem.src.large2x}
                alt={lightbox.currentItem.alt || `Photo by ${lightbox.currentItem.photographer}`}
                className="lightbox-image"
                initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                {...lightbox.getNextButtonProps()}
                className="lightbox-nav lightbox-nav--next"
              >
                ›
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
