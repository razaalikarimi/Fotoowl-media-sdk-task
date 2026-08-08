// ─────────────────────────────────────────────────────────
// VideoGrid — Same composition pattern as PhotoGrid but for videos
// ─────────────────────────────────────────────────────────

import type { Video } from '@media-sdk/media-core';
import { useMediaGrid } from '@media-sdk/media-ui-react';

interface VideoGridProps {
  videos: readonly Video[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onVideoClick: (video: Video, index: number) => void;
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

export function VideoGrid({
  videos,
  loading,
  error,
  hasMore,
  onLoadMore,
  onVideoClick,
  emptyMessage = 'No videos found.',
}: VideoGridProps) {
  const {
    getGridProps,
    getItemProps,
    getLoadMoreTriggerProps,
    isEmpty,
  } = useMediaGrid({
    items: videos,
    hasMore,
    onLoadMore,
    onItemClick: onVideoClick,
    isLoading: loading,
    getItemKey: (video) => video.id,
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
        className="video-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {videos.map((video, index) => {
          const { key, ...itemProps } = getItemProps(video, index);
          return (
            <motion.div
              key={key}
              {...itemProps}
              layoutId={`video-${video.id}`}
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              whileTap={{ scale: 0.98 }}
              className="video-grid-item"
            >
              <motion.img
                src={video.image}
                alt={`Video by ${video.user.name}`}
                loading="lazy"
                className="video-grid-thumb"
                initial={{ filter: 'blur(10px)', opacity: 0 }}
                animate={{ filter: 'blur(0px)', opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="video-grid-overlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <span className="video-grid-duration">
                  {formatDuration(video.duration)}
                </span>
                <span className="video-grid-author">{video.user.name}</span>
              </motion.div>
              <div className="video-play-icon" aria-hidden="true">▶</div>
            </motion.div>
          );
        })}
      </motion.div>

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
