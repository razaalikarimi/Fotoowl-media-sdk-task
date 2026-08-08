// ─────────────────────────────────────────────────────────
// media-react — React context for MediaClient
// ─────────────────────────────────────────────────────────

import { createContext } from 'react';
import type { MediaClient } from '@media-sdk/media-core';

/**
 * React context for the MediaClient instance.
 * null when no provider is present — hooks should throw
 * a clear error in that case.
 */
export const MediaContext = createContext<MediaClient | null>(null);
