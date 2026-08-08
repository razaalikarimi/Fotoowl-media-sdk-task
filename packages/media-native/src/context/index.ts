// ─────────────────────────────────────────────────────────
// media-native — React Native context for MediaClient
// ─────────────────────────────────────────────────────────
//
// Note: This package mirrors media-react but for React Native.
// No DOM APIs, no browser-specific code.
//
// Limitation: This package has not been tested in a real
// React Native runtime. The architecture is valid and the
// types are correct, but integration testing requires an
// RN environment.
// ─────────────────────────────────────────────────────────

import { createContext } from 'react';
import type { MediaClient } from '@media-sdk/media-core';

export const MediaNativeContext = createContext<MediaClient | null>(null);
