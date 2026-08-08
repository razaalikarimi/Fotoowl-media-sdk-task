---
name: wiring-data
description: >
  Teaches an AI coding assistant how to correctly wire data from the media-react
  package into a React application. Covers MediaProvider setup, authentication,
  hooks for search/curated/item data, loading/error state handling, event
  subscription, and critical architectural boundaries.
---

# Wiring Data — media-react Integration Guide

## Overview

This skill teaches you how to use `@media-sdk/media-react` to provide data from the Pexels API to a React application. The React wrapper provides a `MediaProvider` context and a set of hooks that adapt the framework-agnostic `@media-sdk/media-core` SDK to React idioms.

## Critical Architecture Rules

### Dependency Direction

```
app → @media-sdk/media-react → @media-sdk/media-core
```

**NEVER** import `@media-sdk/media-core` from UI components. Only the application entry point (e.g., `main.tsx`) should create the client. All other components access data through hooks from `@media-sdk/media-react`.

### What belongs where

| Layer | Responsibility |
|-------|---------------|
| `main.tsx` / entry point | Create client, wrap app in `MediaProvider` |
| Feature components | Use hooks from `@media-sdk/media-react` |
| UI components | Receive data and callbacks via props — NO hooks from media-react |

## Step 1: Install packages

```bash
pnpm add @media-sdk/media-core @media-sdk/media-react
```

## Step 2: Create the client and provider

In your application entry point (`main.tsx` or `App.tsx`):

```tsx
import { createMediaClient } from '@media-sdk/media-core';
import { MediaProvider } from '@media-sdk/media-react';

// Create the client ONCE at the app boundary
const client = createMediaClient({
  apiKey: import.meta.env.VITE_PEXELS_API_KEY,
  cacheTtlMs: 5 * 60 * 1000, // optional, defaults to 5 minutes
});

function App() {
  return (
    <MediaProvider client={client}>
      <YourAppContent />
    </MediaProvider>
  );
}
```

**Important:** Never create the client inside a component. It should be created once and stay stable.

## Step 3: Search for photos

```tsx
import { useMediaSearch } from '@media-sdk/media-react';

function PhotoSearch({ query }: { query: string }) {
  const { data, loading, error, hasMore, loadMore, totalResults } = useMediaSearch(query);

  if (loading && data.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>{totalResults} results found</p>
      {data.map((photo) => (
        <img key={photo.id} src={photo.src.medium} alt={photo.alt} />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

### Hook behavior:
- `data` is an **accumulated** array — each `loadMore()` appends new items
- `loading` is true during both initial fetch and load-more
- `error` is null on success, an `Error` instance on failure
- `hasMore` indicates if more pages are available
- Query changes reset accumulated data and fetch page 1

## Step 4: Search for videos

```tsx
import { useMediaSearchVideos } from '@media-sdk/media-react';

function VideoSearch({ query }: { query: string }) {
  const { data, loading, error, hasMore, loadMore } = useMediaSearchVideos(query);
  // Same API as useMediaSearch, returns Video[] instead of Photo[]
}
```

## Step 5: Curated photos

```tsx
import { useMediaCurated } from '@media-sdk/media-react';

function CuratedPhotos() {
  const { data, loading, error, hasMore, loadMore } = useMediaCurated();
  // Fetches curated photos on mount. Same pagination pattern.
}
```

## Step 6: Single item by ID

```tsx
import { useMediaItem } from '@media-sdk/media-react';

function PhotoDetail({ photoId }: { photoId: number }) {
  const { data, loading, error } = useMediaItem('photo', photoId);
  // Pass null as ID to skip the fetch
}
```

## Step 7: Subscribe to events

```tsx
import { useMediaEvents, useMediaClient } from '@media-sdk/media-react';

function EventTracker() {
  // Subscribe to events — auto-cleans up on unmount
  useMediaEvents('view', (event) => {
    analytics.track('media_view', {
      mediaId: event.mediaId,
      mediaType: event.mediaType,
    });
  });

  useMediaEvents('download', (event) => {
    analytics.track('media_download', event);
  });

  return null;
}

// To EMIT events, get the client directly:
function PhotoCard({ photo }) {
  const client = useMediaClient();

  const handleView = () => {
    client.emit('view', {
      mediaId: photo.id,
      mediaType: 'photo',
      timestamp: Date.now(),
      url: photo.src.large,
    });
  };

  return <div onClick={handleView}>...</div>;
}
```

## Step 8: Search with options

```tsx
const results = useMediaSearch(query, {
  orientation: 'landscape', // 'landscape' | 'portrait' | 'square'
  size: 'large',            // 'large' | 'medium' | 'small'
  locale: 'en-US',          // language locale
  color: '#ff0000',         // color filter
  perPage: 20,              // items per page (default: 15)
});
```

## Error handling patterns

```tsx
import { AuthenticationError, NetworkError, RateLimitError } from '@media-sdk/media-core';

function SearchWithErrorHandling({ query }) {
  const { data, error } = useMediaSearch(query);

  if (error) {
    if (error instanceof AuthenticationError) {
      return <div>Invalid API key. Check your configuration.</div>;
    }
    if (error instanceof RateLimitError) {
      return <div>Too many requests. Please try again later.</div>;
    }
    if (error instanceof NetworkError) {
      return <div>Network error. Check your connection.</div>;
    }
    return <div>Something went wrong: {error.message}</div>;
  }

  return <div>{/* render data */}</div>;
}
```

## Anti-Patterns — DO NOT DO THESE

### ❌ Import media-core in UI components
```tsx
// WRONG — UI components should NOT import from media-core
import { createMediaClient } from '@media-sdk/media-core';
```

### ❌ Create client inside a component
```tsx
// WRONG — creates a new client on every render
function App() {
  const client = createMediaClient({ apiKey: '...' }); // ❌
  return <MediaProvider client={client}>...</MediaProvider>;
}
```

### ❌ Pass API key through props
```tsx
// WRONG — API key should only be in the client config
<PhotoGrid apiKey="..." /> // ❌
```

### ❌ Call fetch/axios directly for Pexels
```tsx
// WRONG — all API calls go through the SDK
const response = await fetch('https://api.pexels.com/v1/search?query=nature'); // ❌
```

### ❌ Duplicate business logic in the wrapper
```tsx
// WRONG — hooks should only manage React state, not API logic
function useSearch(query) {
  // Don't re-implement pagination, caching, or error mapping here
}
```

## Environment Variables

Create a `.env` file in your project root:
```
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

**Security note:** This key is exposed in the browser bundle. In production, proxy API calls through a backend server.
