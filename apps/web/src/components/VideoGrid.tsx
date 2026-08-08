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
      <div {...getGridProps()} className="video-grid">
        {videos.map((video, index) => (
          <div
            {...getItemProps(video, index)}
            className="video-grid-item"
          >
            <img
              src={video.image}
              alt={`Video by ${video.user.name}`}
              loading="lazy"
              className="video-grid-thumb"
            />
            <div className="video-grid-overlay">
              <span className="video-grid-duration">
                {formatDuration(video.duration)}
              </span>
              <span className="video-grid-author">{video.user.name}</span>
            </div>
            <div className="video-play-icon" aria-hidden="true">▶</div>
          </div>
        ))}
      </div>

      <div {...getLoadMoreTriggerProps()} />

      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading" />
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
