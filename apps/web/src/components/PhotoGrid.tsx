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
      <div {...getGridProps()} className="photo-grid">
        {photos.map((photo, index) => (
          <div
            {...getItemProps(photo, index)}
            className="photo-grid-item"
            style={{
              ...getItemProps(photo, index).style,
              backgroundColor: photo.avgColor,
              aspectRatio: `${photo.width} / ${photo.height}`,
            }}
          >
            <img
              src={photo.src.medium}
              alt={photo.alt || `Photo by ${photo.photographer}`}
              loading="lazy"
              className="photo-grid-img"
            />
            <div className="photo-grid-overlay">
              <span className="photo-grid-photographer">
                {photo.photographer}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div {...getLoadMoreTriggerProps()} />

      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading" />
        </div>
      )}
    </div>
  );
}
