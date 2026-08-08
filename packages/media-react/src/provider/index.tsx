// ─────────────────────────────────────────────────────────
// media-react — MediaProvider component
// ─────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import type { MediaClient } from '@media-sdk/media-core';
import { MediaContext } from '../context/index.js';

export interface MediaProviderProps {
  /** The MediaClient instance created via createMediaClient() */
  client: MediaClient;
  children: ReactNode;
}

/**
 * Provides the MediaClient instance to the React tree.
 *
 * @example
 * ```tsx
 * const client = createMediaClient({ apiKey: '...' });
 *
 * <MediaProvider client={client}>
 *   <App />
 * </MediaProvider>
 * ```
 */
export function MediaProvider({ client, children }: MediaProviderProps) {
  return (
    <MediaContext.Provider value={client}>
      {children}
    </MediaContext.Provider>
  );
}
