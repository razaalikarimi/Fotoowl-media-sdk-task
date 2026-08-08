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

  if (!lightbox.isOpen || !lightbox.currentItem) return null;

  const photo = lightbox.currentItem;

  return (
    <div {...lightbox.getOverlayProps()} className="lightbox-overlay">
      <div {...lightbox.getContentProps()} className="lightbox-content">
        <div className="lightbox-header">
          <div className="lightbox-info">
            <span className="lightbox-photographer">{photo.photographer}</span>
            <span className="lightbox-counter">
              {lightbox.currentIndex + 1} / {photos.length}
            </span>
          </div>
          <div className="lightbox-actions">
            <button
              {...lightbox.getDownloadButtonProps()}
              className="lightbox-btn"
              title="Download"
            >
              ↓
            </button>
            <button
              {...lightbox.getCloseButtonProps()}
              className="lightbox-btn lightbox-btn--close"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="lightbox-image-container">
          <button
            {...lightbox.getPrevButtonProps()}
            className="lightbox-nav lightbox-nav--prev"
          >
            ‹
          </button>

          <img
            src={photo.src.large2x}
            alt={photo.alt || `Photo by ${photo.photographer}`}
            className="lightbox-image"
          />

          <button
            {...lightbox.getNextButtonProps()}
            className="lightbox-nav lightbox-nav--next"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
