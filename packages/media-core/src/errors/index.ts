// ─────────────────────────────────────────────────────────
// media-core errors — Structured error hierarchy
// ─────────────────────────────────────────────────────────

/** Error detail structure for programmatic handling */
export interface MediaErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}

/**
 * Base error for all media SDK errors.
 * Consumers can `instanceof` check against specific subclasses.
 */
export class MediaError extends Error {
  readonly code: string;
  readonly status?: number;
  override readonly cause?: unknown;

  constructor(details: MediaErrorDetails) {
    super(details.message);
    this.name = 'MediaError';
    this.code = details.code;
    this.status = details.status;
    this.cause = details.cause;
  }
}

/**
 * Thrown when the API key is missing, invalid, or rejected.
 */
export class AuthenticationError extends MediaError {
  constructor(message = 'Invalid or missing API key', cause?: unknown) {
    super({
      code: 'AUTH_ERROR',
      message,
      status: 401,
      cause,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown for non-auth API errors (4xx/5xx responses).
 */
export class ApiError extends MediaError {
  constructor(message: string, status: number, cause?: unknown) {
    super({
      code: 'API_ERROR',
      message,
      status,
      cause,
    });
    this.name = 'ApiError';
  }
}

/**
 * Thrown when a network request fails (timeout, DNS, offline, etc.).
 */
export class NetworkError extends MediaError {
  constructor(message = 'Network request failed', cause?: unknown) {
    super({
      code: 'NETWORK_ERROR',
      message,
      cause,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Thrown when input validation fails before making a request.
 */
export class ValidationError extends MediaError {
  constructor(message: string, cause?: unknown) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      cause,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when a requested resource is not found (404).
 */
export class NotFoundError extends MediaError {
  constructor(message = 'Resource not found', cause?: unknown) {
    super({
      code: 'NOT_FOUND',
      message,
      status: 404,
      cause,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when the API rate limit is exceeded (429).
 */
export class RateLimitError extends MediaError {
  constructor(message = 'API rate limit exceeded', cause?: unknown) {
    super({
      code: 'RATE_LIMIT',
      message,
      status: 429,
      cause,
    });
    this.name = 'RateLimitError';
  }
}
