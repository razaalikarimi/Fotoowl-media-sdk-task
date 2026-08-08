// ─────────────────────────────────────────────────────────
// media-core tests — Error hierarchy
// ─────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  MediaError,
  AuthenticationError,
  ApiError,
  NetworkError,
  ValidationError,
  NotFoundError,
  RateLimitError,
} from '../src/errors/index.js';

describe('Error hierarchy', () => {
  it('all errors extend MediaError', () => {
    expect(new AuthenticationError()).toBeInstanceOf(MediaError);
    expect(new ApiError('msg', 500)).toBeInstanceOf(MediaError);
    expect(new NetworkError()).toBeInstanceOf(MediaError);
    expect(new ValidationError('msg')).toBeInstanceOf(MediaError);
    expect(new NotFoundError()).toBeInstanceOf(MediaError);
    expect(new RateLimitError()).toBeInstanceOf(MediaError);
  });

  it('all errors extend Error', () => {
    expect(new MediaError({ code: 'TEST', message: 'test' })).toBeInstanceOf(Error);
    expect(new AuthenticationError()).toBeInstanceOf(Error);
  });

  it('AuthenticationError has correct defaults', () => {
    const err = new AuthenticationError();
    expect(err.code).toBe('AUTH_ERROR');
    expect(err.status).toBe(401);
    expect(err.name).toBe('AuthenticationError');
  });

  it('ApiError carries status code', () => {
    const err = new ApiError('Server error', 503);
    expect(err.code).toBe('API_ERROR');
    expect(err.status).toBe(503);
    expect(err.message).toBe('Server error');
  });

  it('NetworkError has no status', () => {
    const err = new NetworkError();
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.status).toBeUndefined();
  });

  it('ValidationError carries custom message', () => {
    const err = new ValidationError('Query must not be empty');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Query must not be empty');
  });

  it('NotFoundError has 404 status', () => {
    const err = new NotFoundError();
    expect(err.status).toBe(404);
  });

  it('RateLimitError has 429 status', () => {
    const err = new RateLimitError();
    expect(err.status).toBe(429);
  });

  it('errors can carry a cause', () => {
    const cause = new TypeError('original');
    const err = new NetworkError('fail', cause);
    expect(err.cause).toBe(cause);
  });

  it('errors can be caught and discriminated by instanceof', () => {
    const error: Error = new AuthenticationError();

    if (error instanceof AuthenticationError) {
      expect(error.code).toBe('AUTH_ERROR');
    } else {
      throw new Error('Should have matched AuthenticationError');
    }
  });
});
