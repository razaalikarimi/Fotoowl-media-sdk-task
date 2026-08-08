---
name: using-components
description: >
  Teaches an AI coding assistant how to correctly use the headless UI components
  from media-ui-react: Grid (with infinite scroll), Lightbox (with keyboard/focus),
  and Reel Swiper (vertical snap paging). Covers the prop-getter pattern,
  consumer-owned CSS, accessibility, callbacks, and composition with data hooks.
---

# Using Components — media-ui-react Headless UI Guide

## Overview

This skill teaches you how to use `@media-sdk/media-ui-react`, a headless component library that provides behavior, accessibility, and state management through hooks and prop-getters. **It ships zero styles.** The consumer (your app) controls all markup and CSS.

## Critical Architecture Rules

### Independence from SDK

```
@media-sdk/media-ui-react ────X──── @media-sdk/media-core
@media-sdk/media-ui-react ────X──── @media-sdk/media-react
```

The UI library has **NO knowledge of Pexels or the SDK**. It receives generic data through props. Your app is the composition layer that maps SDK types to UI component props.

### The Headless Pattern

Components follow the **prop-getter** pattern (inspired by Downshift):

```
Hook returns → prop-getter functions → spread onto your elements → you control CSS
```

```tsx
const { getGridProps, getItemProps } = useMediaGrid({ items, ... });

// YOU decide the markup and styles:
<div {...getGridProps()} className="my-custom-grid">
  {items.map((item, i) => (
    <div {...getItemProps(item, i)} className="my-custom-item">
      {/* YOUR content */}
    </div>
  ))}
</div>
```

## Installation

```bash
pnpm add @media-sdk/media-ui-react
```

No need to install `media-core` or `media-react` — the UI library is independent.

---

## Grid — `useMediaGrid`

### Purpose
A headless grid with infinite scroll support, keyboard navigation, and accessibility.

### API

```tsx
import { useMediaGrid } from '@media-sdk/media-ui-react';

const {
  getGridProps,        // → spread onto container element
  getItemProps,        // → spread onto each item element
  getLoadMoreButtonProps,    // → spread onto a manual "Load More" button
  getLoadMoreTriggerProps,   // → spread onto an invisible sentinel for auto-loading
  items,               // passthrough of your items
  isLoading,           // whether data is loading
  isEmpty,             // items.length === 0 && !isLoading
  hasMore,             // whether more items can be loaded
} = useMediaGrid({
  items: Photo[],          // your data array (generic, any type)
  hasMore: boolean,        // from useMediaSearch().hasMore
  onLoadMore: () => void,  // from useMediaSearch().loadMore
  onItemClick: (item, index) => void,  // what happens on click
  isLoading: boolean,      // from useMediaSearch().loading
  getItemKey: (item, index) => string | number,  // unique key
  useIntersectionObserver: true,  // auto-load on scroll (default)
});
```

### Complete Example (with data wiring)

```tsx
import { useMediaSearch } from '@media-sdk/media-react';
import { useMediaGrid } from '@media-sdk/media-ui-react';
import type { Photo } from '@media-sdk/media-core';

function PhotoGrid({ query }: { query: string }) {
  // Data from SDK (via media-react)
  const { data, loading, hasMore, loadMore } = useMediaSearch(query);

  // UI behavior from headless library (via media-ui-react)
  const grid = useMediaGrid({
    items: data,
    hasMore,
    onLoadMore: loadMore,
    onItemClick: (photo: Photo) => console.log('Clicked:', photo.id),
    isLoading: loading,
    getItemKey: (photo: Photo) => photo.id,
  });

  if (grid.isEmpty) return <p>No results found.</p>;

  return (
    <div {...grid.getGridProps()} className="photo-grid">
      {grid.items.map((photo, i) => (
        <div
          {...grid.getItemProps(photo, i)}
          className="photo-card"
          style={{ backgroundColor: photo.avgColor }}
        >
          <img src={photo.src.medium} alt={photo.alt} loading="lazy" />
          <span>{photo.photographer}</span>
        </div>
      ))}

      {/* Invisible sentinel: triggers loadMore when scrolled into view */}
      <div {...grid.getLoadMoreTriggerProps()} />

      {grid.isLoading && <div className="spinner">Loading...</div>}
    </div>
  );
}
```

### Grid CSS (consumer-owned)

```css
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.photo-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.photo-card:hover { transform: scale(1.02); }
.photo-card:focus-visible { outline: 2px solid blue; }
```

---

## Lightbox — `useMediaLightbox`

### Purpose
A headless lightbox with keyboard navigation (arrows, Escape), focus trap, body scroll lock, and accessible ARIA attributes.

### API

```tsx
import { useMediaLightbox } from '@media-sdk/media-ui-react';

const {
  isOpen,              // whether lightbox is visible
  currentItem,         // the currently displayed item
  currentIndex,        // index in the items array
  hasPrev, hasNext,    // navigation boundaries
  open,                // (item, index) => void
  close,               // () => void
  next, prev,          // () => void
  getOverlayProps,     // → spread onto backdrop/overlay
  getContentProps,     // → spread onto content container
  getCloseButtonProps, // → spread onto close button
  getPrevButtonProps,  // → spread onto prev button
  getNextButtonProps,  // → spread onto next button
  getDownloadButtonProps, // → spread onto download button
} = useMediaLightbox({
  items: Photo[],
  onClose: () => void,
  onChange: (item, index) => void,   // called when active item changes
  onDownload: (item, index) => void, // called when download is triggered
  getItemKey: (item, index) => string | number,
  trapFocus: true,          // default: true
  closeOnEscape: true,      // default: true
  closeOnOverlayClick: true, // default: true
});
```

### Complete Example

```tsx
function PhotoLightbox({ photos, onClose }) {
  const lb = useMediaLightbox({
    items: photos,
    onClose,
    getItemKey: (p) => p.id,
  });

  // Open from a grid click:
  // lb.open(photo, index);

  if (!lb.isOpen || !lb.currentItem) return null;

  return (
    <div {...lb.getOverlayProps()} className="lightbox-backdrop">
      <div {...lb.getContentProps()} className="lightbox-body">
        <button {...lb.getCloseButtonProps()} className="close-btn">✕</button>
        <button {...lb.getPrevButtonProps()} className="nav-btn">←</button>
        <img src={lb.currentItem.src.large2x} alt={lb.currentItem.alt} />
        <button {...lb.getNextButtonProps()} className="nav-btn">→</button>
        <p>{lb.currentIndex + 1} / {photos.length}</p>
      </div>
    </div>
  );
}
```

### Keyboard Behavior (built-in)
- **Escape** → close
- **ArrowRight** → next
- **ArrowLeft** → prev
- **Focus trap** → focus stays within lightbox

### Accessibility (built-in via prop-getters)
- `role="dialog"` and `aria-modal="true"` on overlay
- `aria-label` on all buttons
- Focus restored to previous element on close
- Body scroll locked when open

---

## Reel Swiper — `useMediaReel`

### Purpose
A vertical snap-paging component for TikTok/Reels-style media browsing. Uses CSS `scroll-snap` for native feel and `IntersectionObserver` for active-item detection.

### API

```tsx
import { useMediaReel } from '@media-sdk/media-ui-react';

const {
  activeIndex,           // index of the most visible item
  activeItem,            // the most visible item
  getReelContainerProps, // → spread onto scroll container
  getReelItemProps,      // → spread onto each item
  scrollToIndex,         // (index) => void — programmatic scroll
  items,                 // passthrough
} = useMediaReel({
  items: Video[],
  onActiveChange: (item, index) => void,  // called when active changes
  onItemVisible: (item, index) => void,   // called when any item enters view
  getItemKey: (item, index) => string | number,
  activeThreshold: 0.5,  // visibility ratio threshold (default)
});
```

### Complete Example

```tsx
function VideoReels({ videos }) {
  const reel = useMediaReel({
    items: videos,
    onActiveChange: (video) => {
      client.emit('view', {
        mediaId: video.id,
        mediaType: 'video',
        timestamp: Date.now(),
      });
    },
    getItemKey: (v) => v.id,
  });

  return (
    <div
      {...reel.getReelContainerProps()}
      className="reel-container"
      style={{ ...reel.getReelContainerProps().style, height: '100vh' }}
    >
      {videos.map((video, i) => (
        <div
          {...reel.getReelItemProps(video, i)}
          className="reel-item"
          style={{ ...reel.getReelItemProps(video, i).style }}
        >
          <video
            src={video.videoFiles[0]?.link}
            autoPlay={i === reel.activeIndex}
            muted
            loop
            playsInline
          />
          <div className="reel-info">{video.user.name}</div>
        </div>
      ))}
    </div>
  );
}
```

### Reel CSS (consumer-owned)

```css
.reel-container {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}
.reel-container::-webkit-scrollbar { display: none; }

.reel-item {
  height: 100vh;
  scroll-snap-align: start;
  position: relative;
}
```

---

## Composition Pattern

The app connects data (from `media-react`) to UI (from `media-ui-react`):

```tsx
// App.tsx — THE COMPOSITION LAYER
import { useMediaSearch } from '@media-sdk/media-react';     // DATA
import { useMediaGrid, useMediaLightbox } from '@media-sdk/media-ui-react'; // UI

function App() {
  const { data, loading, hasMore, loadMore } = useMediaSearch(query);
  const grid = useMediaGrid({ items: data, hasMore, onLoadMore: loadMore, ... });
  const lightbox = useMediaLightbox({ items: data, ... });

  return (
    <div {...grid.getGridProps()}>
      {data.map((photo, i) => (
        <div
          {...grid.getItemProps(photo, i)}
          onClick={() => lightbox.open(photo, i)}
        >
          <img src={photo.src.medium} alt={photo.alt} />
        </div>
      ))}
      {lightbox.isOpen && <Lightbox {...lightbox} />}
    </div>
  );
}
```

## Anti-Patterns — DO NOT DO THESE

### ❌ Import SDK types inside UI components
```tsx
// WRONG — UI components should not know about Pexels
import type { Photo } from '@media-sdk/media-core'; // ❌ inside a UI component
```
Instead, use generic types and let the app map SDK types to component props.

### ❌ Hardcode styles in the hooks
```tsx
// WRONG — styles are the consumer's responsibility
<div style={{ display: 'grid', gap: '1rem' }} {...getGridProps()}>
// The hook provides behavior props, not layout props (except scroll-snap for reel)
```

### ❌ Skip prop-getters and implement behavior manually
```tsx
// WRONG — loses keyboard handling, ARIA, IntersectionObserver
<div onClick={() => openLightbox()} onKeyDown={...} role="dialog">
// Instead use: <div {...getOverlayProps()}>
```

### ❌ Import media-core or media-react from the UI library
```tsx
// WRONG — violates architecture boundary
import { useMediaSearch } from '@media-sdk/media-react'; // ❌ inside media-ui-react
```

### ❌ Pass the MediaClient to UI components
```tsx
// WRONG — UI components should not know about the client
<Grid client={client} /> // ❌
// Instead, the app fetches data and passes it as props
```

## Accessibility Checklist

- [x] Grid items: `role="listitem"`, `tabIndex`, keyboard Enter/Space
- [x] Lightbox: `role="dialog"`, `aria-modal`, focus trap, Escape to close
- [x] Reel: `role="feed"`, `role="article"` per item, `aria-current` for active
- [x] All buttons: `aria-label`, `type="button"`
- [x] Disabled states: `disabled` attribute on nav buttons at boundaries
- [x] Focus restoration: previous element re-focused when lightbox closes

## Styling Contract

| Hook | What it provides | What YOU provide |
|------|-----------------|-----------------|
| Grid | `role`, `aria-*`, click/keyboard handlers | Grid layout CSS, item styling, images |
| Lightbox | Dialog behavior, keyboard nav, focus trap | Overlay CSS, image display, button styling |
| Reel | Scroll-snap CSS, active detection | Item layout, video player, overlay info |
