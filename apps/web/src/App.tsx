import { useState } from 'react';
import {
  useMediaSearch,
  useMediaSearchVideos,
  useMediaEvents,
  useMediaClient,
} from '@media-sdk/media-react';
import type { Photo, Video } from '@media-sdk/media-core';
import { SearchBar } from './components/SearchBar.js';
import { PhotoGrid } from './components/PhotoGrid.js';
import { VideoGrid } from './components/VideoGrid.js';
import { PhotoLightbox } from './components/PhotoLightbox.js';
import { VideoReels } from './components/VideoReels.js';
import { EventLog } from './components/EventLog.js';

/**
 * Main application — the ONLY place that wires together
 * data hooks (from media-react) with UI hooks (from media-ui-react).
 */
export function App() {
  const client = useMediaClient();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  // Data hooks from media-react
  const photoSearch = useMediaSearch(query);
  const videoSearch = useMediaSearchVideos(query);

  // Event tracking demonstration
  const [eventLog, setEventLog] = useState<Array<{ type: string; data: string; time: string }>>([]);

  useMediaEvents('view', (event) => {
    setEventLog((prev) => [
      {
        type: 'view',
        data: `${event.mediaType} #${event.mediaId}`,
        time: new Date(event.timestamp).toLocaleTimeString(),
      },
      ...prev.slice(0, 49), // Keep last 50 events
    ]);
  });

  useMediaEvents('download', (event) => {
    setEventLog((prev) => [
      {
        type: 'download',
        data: `${event.mediaType} #${event.mediaId}`,
        time: new Date(event.timestamp).toLocaleTimeString(),
      },
      ...prev.slice(0, 49),
    ]);
  });

  // Lightbox state
  const [lightboxPhotos, setLightboxPhotos] = useState<readonly Photo[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Reels state
  const [reelsVideos, setReelsVideos] = useState<readonly Video[]>([]);
  const [showReels, setShowReels] = useState(false);

  const handlePhotoClick = (photo: Photo, index: number) => {
    // Emit view event
    client.emit('view', {
      mediaId: photo.id,
      mediaType: 'photo',
      timestamp: Date.now(),
      url: photo.src.large,
    });
    setLightboxPhotos(photoSearch.data);
    setLightboxInitialIndex(index);
    setShowLightbox(true);
  };

  const handlePhotoDownload = (photo: Photo) => {
    client.emit('download', {
      mediaId: photo.id,
      mediaType: 'photo',
      timestamp: Date.now(),
      url: photo.src.original,
    });
    window.open(photo.src.original, '_blank');
  };

  const handleVideoClick = (_video: Video, index: number) => {
    setReelsVideos(videoSearch.data);
    setShowReels(true);
    // View event emitted in the reels component when visible
    void index;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Media SDK Explorer</h1>
        <p className="app-subtitle">
          Powered by Pexels API via Headless Media SDK
        </p>
      </header>

      <main className="app-main">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search photos and videos..."
        />

        {query.trim() && (
          <nav className="tab-nav" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'photos'}
              className={`tab-btn ${activeTab === 'photos' ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
              {photoSearch.totalResults !== undefined && (
                <span className="tab-count">{photoSearch.totalResults.toLocaleString()}</span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'videos'}
              className={`tab-btn ${activeTab === 'videos' ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
              {videoSearch.totalResults !== undefined && (
                <span className="tab-count">{videoSearch.totalResults.toLocaleString()}</span>
              )}
            </button>
          </nav>
        )}

        {activeTab === 'photos' && (
          <PhotoGrid
            photos={photoSearch.data}
            loading={photoSearch.loading}
            error={photoSearch.error}
            hasMore={photoSearch.hasMore}
            onLoadMore={photoSearch.loadMore}
            onPhotoClick={handlePhotoClick}
            emptyMessage={
              query.trim()
                ? 'No photos found. Try a different search.'
                : 'Search for photos above to get started.'
            }
          />
        )}

        {activeTab === 'videos' && (
          <VideoGrid
            videos={videoSearch.data}
            loading={videoSearch.loading}
            error={videoSearch.error}
            hasMore={videoSearch.hasMore}
            onLoadMore={videoSearch.loadMore}
            onVideoClick={handleVideoClick}
            emptyMessage={
              query.trim()
                ? 'No videos found. Try a different search.'
                : 'Search for videos above to get started.'
            }
          />
        )}

        <EventLog events={eventLog} />
      </main>

      {showLightbox && (
        <PhotoLightbox
          photos={lightboxPhotos}
          initialIndex={lightboxInitialIndex}
          onClose={() => setShowLightbox(false)}
          onDownload={handlePhotoDownload}
          onView={(photo) => {
            client.emit('view', {
              mediaId: photo.id,
              mediaType: 'photo',
              timestamp: Date.now(),
              url: photo.src.large,
            });
          }}
        />
      )}

      {showReels && (
        <VideoReels
          videos={reelsVideos}
          onClose={() => setShowReels(false)}
          onView={(video) => {
            client.emit('view', {
              mediaId: video.id,
              mediaType: 'video',
              timestamp: Date.now(),
              url: video.url,
            });
          }}
        />
      )}
    </div>
  );
}
