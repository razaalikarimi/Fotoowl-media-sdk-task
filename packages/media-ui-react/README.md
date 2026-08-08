# @media-sdk/media-ui-react

Headless React UI components for media grids, lightboxes, and reels.

## Features

- **Zero CSS**: Completely headless. You control the markup and styles.
- **Prop-Getters**: `useMediaGrid`, `useMediaLightbox`, `useMediaReel`.
- **Accessible**: Built-in ARIA roles, focus management, keyboard navigation.
- **Infinite Scroll**: Uses `IntersectionObserver` via sentinel nodes.
- **Snap Paging**: `useMediaReel` calculates active items seamlessly.

## Usage

```tsx
import { useMediaGrid } from '@media-sdk/media-ui-react';

function CustomGrid({ items }) {
  const { getGridProps, getItemProps } = useMediaGrid({ 
    items, 
    getItemKey: i => i.id 
  });

  return (
    <div {...getGridProps()} className="my-grid">
      {items.map((item, index) => (
        <div {...getItemProps(item, index)} className="my-item">
          <img src={item.src} />
        </div>
      ))}
    </div>
  );
}
```

**Architecture Note**: This package MUST NOT depend on `@media-sdk/media-core` or `@media-sdk/media-react`. It is strictly generic and agnostic of SDK types.
