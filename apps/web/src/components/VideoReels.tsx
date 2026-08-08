// ─────────────────────────────────────────────────────────
// VideoReels — Composes media-ui-react's useMediaReel
// with Video data for a TikTok/Reels-style vertical view.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import type { Video } from '@media-sdk/media-core';
import { useMediaReel } from '@media-sdk/media-ui-react';

interface VideoReelsProps {
  videos: readonly Video[];
  onClose: () => void;
  onView?: (video: Video) => void;
}

export function VideoReels({ videos, onClose, onView }: VideoReelsProps) {
  const reel = useMediaReel({
    items: videos,
    onActiveChange: (video) => {
      onView?.(video);
    },
    getItemKey: (video) => video.id,
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return (
    <div className="reels-overlay">
      <div className="reels-header">
        <h2>Video Reels</h2>
        <button
          className="reels-close-btn"
          onClick={onClose}
          aria-label="Close reels"
          type="button"
        >
          ✕
        </button>
      </div>

      <div
        {...reel.getReelContainerProps()}
        className="reels-container"
      >
        {videos.map((video, index) => (
          <div
            {...reel.getReelItemProps(video, index)}
            className="reel-item"
          >
            <ReelVideo
              video={video}
              isActive={index === reel.activeIndex}
            />
            <div className="reel-info">
              <span className="reel-author">{video.user.name}</span>
              <span className="reel-duration">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Individual Video Player ───

function ReelVideo({ video, isActive }: { video: Video; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play/pause based on active state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.play().catch(() => {
        // Autoplay may be blocked — that's OK
      });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive]);

  // Find the best quality video file (prefer HD)
  const videoFile =
    video.videoFiles.find((f) => f.quality === 'hd') ??
    video.videoFiles.find((f) => f.quality === 'sd') ??
    video.videoFiles[0];

  if (!videoFile) return null;

  return (
    <video
      ref={videoRef}
      className="reel-video"
      src={videoFile.link}
      loop
      muted
      playsInline
      poster={video.image}
      aria-label={`Video by ${video.user.name}`}
    />
  );
}
