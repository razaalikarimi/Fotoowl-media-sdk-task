# @media-sdk/media-react

React bindings for the Headless Media SDK.

## Features

- **Context Provider**: Injects the MediaClient safely into the React tree.
- **Declarative Data Fetching**: `useMediaSearch`, `useMediaCurated`, `useMediaItem`.
- **Event Subscription**: `useMediaEvents` automatically handles cleanup.
- **Pagination**: Built-in `loadMore` state for infinite scrolling.

## Usage

```tsx
import { createMediaClient } from '@media-sdk/media-core';
import { MediaProvider, useMediaSearch } from '@media-sdk/media-react';

const client = createMediaClient({ apiKey: 'YOUR_KEY' });

function App() {
  return (
    <MediaProvider client={client}>
      <Search />
    </MediaProvider>
  );
}

function Search() {
  const { data, loading, loadMore } = useMediaSearch('nature');
  // ...
}
```

**Architecture Note**: UI components should NEVER import from `@media-sdk/media-core`. They should receive data from these hooks.
