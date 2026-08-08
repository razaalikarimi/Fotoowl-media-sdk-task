# @media-sdk/media-core

The core framework-agnostic business logic for the Headless Media SDK.

## Features

- **Zero Dependencies**: Uses native `fetch`, works in Node, Browser, React Native.
- **Request Deduplication**: Concurrent identical requests are merged.
- **TTL Caching**: Responses are cached for a configurable duration.
- **Event Emitter**: Strongly typed events for `view` and `download`.
- **Custom Errors**: Hierarchical error types (`AuthenticationError`, `RateLimitError`, etc.).

## Usage

```typescript
import { createMediaClient } from '@media-sdk/media-core';

const client = createMediaClient({
  apiKey: 'YOUR_PEXELS_API_KEY',
  cacheTtlMs: 5 * 60 * 1000 // 5 minutes
});

// Search
const results = await client.search('nature', { perPage: 15 });

// Events
client.on('view', (event) => {
  console.log(`Viewed photo ${event.mediaId}`);
});
```

**Architecture Note**: This package MUST NOT depend on React, React Native, or DOM APIs.
