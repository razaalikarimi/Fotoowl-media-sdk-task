// ─────────────────────────────────────────────────────────
// media-native — MediaNativeProvider component
// ─────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import type { MediaClient } from '@media-sdk/media-core';
import { MediaNativeContext } from '../context/index.js';

export interface MediaNativeProviderProps {
  client: MediaClient;
  children: ReactNode;
}

/**
 * Provides the MediaClient instance to a React Native component tree.
 *
 * @example
 * ```tsx
 * import { createMediaClient } from '@media-sdk/media-core';
 * import { MediaNativeProvider } from '@media-sdk/media-native';
 *
 * const client = createMediaClient({ apiKey: '...' });
 *
 * export default function App() {
 *   return (
 *     <MediaNativeProvider client={client}>
 *       <HomeScreen />
 *     </MediaNativeProvider>
 *   );
 * }
 * ```
 */
export function MediaNativeProvider({ client, children }: MediaNativeProviderProps) {
  return (
    <MediaNativeContext.Provider value={client}>
      {children}
    </MediaNativeContext.Provider>
  );
}
