// ─────────────────────────────────────────────────────────
// media-core tests — Auth
// ─────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { validateApiKey, createAuthHeaders } from '../src/auth/index.js';
import { AuthenticationError } from '../src/errors/index.js';

describe('validateApiKey', () => {
  it('should return trimmed key for valid input', () => {
    expect(validateApiKey('  my-api-key  ')).toBe('my-api-key');
  });

  it('should throw AuthenticationError for empty string', () => {
    expect(() => validateApiKey('')).toThrow(AuthenticationError);
  });

  it('should throw AuthenticationError for whitespace-only string', () => {
    expect(() => validateApiKey('   ')).toThrow(AuthenticationError);
  });

  it('should throw AuthenticationError for undefined', () => {
    expect(() => validateApiKey(undefined)).toThrow(AuthenticationError);
  });
});

describe('createAuthHeaders', () => {
  it('should return Authorization header with the key', () => {
    const headers = createAuthHeaders('test-key');
    expect(headers).toEqual({ Authorization: 'test-key' });
  });
});
