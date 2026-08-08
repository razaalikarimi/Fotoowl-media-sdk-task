// ─────────────────────────────────────────────────────────
// VideoReels — Composes media-ui-react's useMediaReel
// with Video data for a TikTok/Reels-style vertical view.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import type { Video } from '@media-sdk/media-core';
import { useMediaReel } from '@media-sdk/media-ui-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      className="reels-overlay"
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="reels-header">
        <h2>Video Reels</h2>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="reels-close-btn"
          onClick={onClose}
          aria-label="Close reels"
          type="button"
        >
          ✕
        </motion.button>
      </div>

      <div
        {...reel.getReelContainerProps()}
        className="reels-container"
      >
        {videos.map((video, index) => {
          const { key, ...itemProps } = reel.getReelItemProps(video, index);
          return (
            <div
              key={key}
              {...itemProps}
              className="reel-item"
            >
              <ReelVideo
                video={video}
                isActive={index === reel.activeIndex}
              />
              <AnimatePresence>
                {index === reel.activeIndex && (
                  <motion.div
                    className="reel-info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="reel-author">{video.user.name}</span>
                    <span className="reel-duration">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
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

  const videoFile =
    video.videoFiles.find((f) => f.quality === 'hd') ??
    video.videoFiles.find((f) => f.quality === 'sd') ??
    video.videoFiles[0];

  if (!videoFile) return null;

  return (
    <motion.video
      ref={videoRef}
      className="reel-video"
      src={videoFile.link}
      loop
      muted
      playsInline
      poster={video.image}
      aria-label={`Video by ${video.user.name}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.5 }}
      transition={{ duration: 0.4 }}
    />
  );
}
