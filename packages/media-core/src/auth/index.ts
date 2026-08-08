// ─────────────────────────────────────────────────────────
// media-core auth — API key configuration
// ─────────────────────────────────────────────────────────

import { AuthenticationError } from '../errors/index.js';

/**
 * Validates and returns the API key.
 * Centralized so the key is only handled in one place.
 *
 * @throws AuthenticationError if the key is missing or empty
 */
export function validateApiKey(apiKey: string | undefined): string {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new AuthenticationError(
      'API key is required. Pass it via createMediaClient({ apiKey: "..." }). ' +
        'Get a free key at https://www.pexels.com/api/',
    );
  }
  return apiKey.trim();
}

/**
 * Creates the authorization headers for Pexels API requests.
 */
export function createAuthHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: apiKey,
  };
}
