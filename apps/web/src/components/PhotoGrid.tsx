// ─────────────────────────────────────────────────────────
// PhotoGrid — Composes media-ui-react's useMediaGrid with
// Photo data from media-react. This is the composition layer.
// ─────────────────────────────────────────────────────────

import type { Photo } from '@media-sdk/media-core';
import { useMediaGrid } from '@media-sdk/media-ui-react';

interface PhotoGridProps {
  photos: readonly Photo[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onPhotoClick: (photo: Photo, index: number) => void;
  emptyMessage?: string;
}

import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function PhotoGrid({
  photos,
  loading,
  error,
  hasMore,
  onLoadMore,
  onPhotoClick,
  emptyMessage = 'No photos found.',
}: PhotoGridProps) {
  const {
    getGridProps,
    getItemProps,
    getLoadMoreTriggerProps,
    isEmpty,
  } = useMediaGrid({
    items: photos,
    hasMore,
    onLoadMore,
    onItemClick: onPhotoClick,
    isLoading: loading,
    getItemKey: (photo) => photo.id,
  });

  if (error) {
    return (
      <div className="error-state" role="alert">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (isEmpty && !loading) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        {...getGridProps()}
        className="photo-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {photos.map((photo, index) => {
          const { key, ...itemProps } = getItemProps(photo, index);
          return (
            <motion.div
              key={key}
              {...itemProps}
              layoutId={`photo-${photo.id}`}
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              whileTap={{ scale: 0.98 }}
              className="photo-grid-item"
              style={{
                ...itemProps.style,
                backgroundColor: photo.avgColor,
                aspectRatio: `${photo.width} / ${photo.height}`,
              }}
            >
              <motion.img
                src={photo.src.medium}
                alt={photo.alt || `Photo by ${photo.photographer}`}
                loading="lazy"
                className="photo-grid-img"
                initial={{ filter: 'blur(10px)', opacity: 0 }}
                animate={{ filter: 'blur(0px)', opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="photo-grid-overlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <span className="photo-grid-photographer">
                  {photo.photographer}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sentinel for infinite scroll */}
      <div {...getLoadMoreTriggerProps()} />

      {loading && (
        <motion.div
          className="loading-state"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="spinner" aria-label="Loading" />
        </motion.div>
      )}
    </div>
  );
}
