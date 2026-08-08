// ─────────────────────────────────────────────────────────
// media-core api — Pexels API endpoint handlers
// ─────────────────────────────────────────────────────────
//
// Raw API layer: handles HTTP requests, response mapping,
// and error translation. No caching here — that's the
// client's responsibility.
// ─────────────────────────────────────────────────────────

import { createAuthHeaders } from '../auth/index.js';
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  RateLimitError,
} from '../errors/index.js';
import type {
  PaginatedResult,
  PaginationOptions,
  Photo,
  PhotoSource,
  SearchOptions,
  Video,
  VideoFile,
  VideoPicture,
  VideoSearchOptions,
  VideoUser,
} from '../types/index.js';

const DEFAULT_BASE_URL = 'https://api.pexels.com';
const DEFAULT_PER_PAGE = 15;

// ─── Raw Pexels Response Types (internal) ───

interface PexelsPhotoRaw {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSource;
  liked: boolean;
  alt: string;
}

interface PexelsPhotosResponse {
  photos: PexelsPhotoRaw[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

interface PexelsVideoFileRaw {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

interface PexelsVideoPictureRaw {
  id: number;
  picture: string;
  nr: number;
}

interface PexelsVideoUserRaw {
  id: number;
  name: string;
  url: string;
}

interface PexelsVideoRaw {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: PexelsVideoUserRaw;
  video_files: PexelsVideoFileRaw[];
  video_pictures: PexelsVideoPictureRaw[];
}

interface PexelsVideosResponse {
  videos: PexelsVideoRaw[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
}

// ─── Response Mapping ───

function mapPhoto(raw: PexelsPhotoRaw): Photo {
  return {
    id: raw.id,
    width: raw.width,
    height: raw.height,
    url: raw.url,
    photographer: raw.photographer,
    photographerUrl: raw.photographer_url,
    photographerId: raw.photographer_id,
    avgColor: raw.avg_color,
    src: raw.src,
    liked: raw.liked,
    alt: raw.alt,
  };
}

function mapVideoFile(raw: PexelsVideoFileRaw): VideoFile {
  return {
    id: raw.id,
    quality: raw.quality,
    fileType: raw.file_type,
    width: raw.width,
    height: raw.height,
    fps: raw.fps,
    link: raw.link,
  };
}

function mapVideoPicture(raw: PexelsVideoPictureRaw): VideoPicture {
  return {
    id: raw.id,
    picture: raw.picture,
    nr: raw.nr,
  };
}

function mapVideoUser(raw: PexelsVideoUserRaw): VideoUser {
  return {
    id: raw.id,
    name: raw.name,
    url: raw.url,
  };
}

function mapVideo(raw: PexelsVideoRaw): Video {
  return {
    id: raw.id,
    width: raw.width,
    height: raw.height,
    url: raw.url,
    image: raw.image,
    duration: raw.duration,
    user: mapVideoUser(raw.user),
    videoFiles: raw.video_files.map(mapVideoFile),
    videoPictures: raw.video_pictures.map(mapVideoPicture),
  };
}

function mapPhotosPagination(
  response: PexelsPhotosResponse,
): PaginatedResult<Photo> {
  const hasNextPage = !!response.next_page;
  return {
    items: response.photos.map(mapPhoto),
    page: response.page,
    perPage: response.per_page,
    totalResults: response.total_results,
    hasNextPage,
    nextPage: hasNextPage ? response.page + 1 : undefined,
  };
}

function mapVideosPagination(
  response: PexelsVideosResponse,
): PaginatedResult<Video> {
  const hasNextPage = !!response.next_page;
  return {
    items: response.videos.map(mapVideo),
    page: response.page,
    perPage: response.per_page,
    totalResults: response.total_results,
    hasNextPage,
    nextPage: hasNextPage ? response.page + 1 : undefined,
  };
}

// ─── HTTP Layer ───

/**
 * Perform an authenticated GET request against the Pexels API.
 * Translates HTTP errors into typed SDK errors.
 */
async function fetchPexels<T>(
  url: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        ...createAuthHeaders(apiKey),
        Accept: 'application/json',
      },
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err; // Let abort errors propagate naturally
    }
    throw new NetworkError(
      `Network request failed: ${err instanceof Error ? err.message : String(err)}`,
      err,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    switch (response.status) {
      case 401:
        throw new AuthenticationError(
          `Authentication failed: ${body || 'Invalid API key'}`,
        );
      case 404:
        throw new NotFoundError(`Resource not found: ${url}`);
      case 429:
        throw new RateLimitError(
          `Rate limit exceeded. ${body || 'Please wait before retrying.'}`,
        );
      default:
        throw new ApiError(
          `API error ${response.status}: ${body || response.statusText}`,
          response.status,
        );
    }
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    throw new ApiError('Failed to parse API response', 500, err);
  }
}

// ─── Query Parameter Builder ───

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

// ─── Public API Functions ───

export interface PexelsApiOptions {
  apiKey: string;
  baseUrl: string;
}

/** Search photos */
export async function searchPhotos(
  query: string,
  options: SearchOptions | undefined,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<PaginatedResult<Photo>> {
  const qs = buildQueryString({
    query,
    page: options?.page,
    per_page: options?.perPage ?? DEFAULT_PER_PAGE,
    orientation: options?.orientation,
    size: options?.size,
    locale: options?.locale,
    color: options?.color,
  });
  const url = `${api.baseUrl}/v1/search${qs}`;
  const raw = await fetchPexels<PexelsPhotosResponse>(url, api.apiKey, signal);
  return mapPhotosPagination(raw);
}

/** Get curated photos */
export async function getCuratedPhotos(
  options: PaginationOptions | undefined,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<PaginatedResult<Photo>> {
  const qs = buildQueryString({
    page: options?.page,
    per_page: options?.perPage ?? DEFAULT_PER_PAGE,
  });
  const url = `${api.baseUrl}/v1/curated${qs}`;
  const raw = await fetchPexels<PexelsPhotosResponse>(url, api.apiKey, signal);
  return mapPhotosPagination(raw);
}

/** Get a single photo by ID */
export async function getPhotoById(
  id: number,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<Photo> {
  const url = `${api.baseUrl}/v1/photos/${id}`;
  const raw = await fetchPexels<PexelsPhotoRaw>(url, api.apiKey, signal);
  return mapPhoto(raw);
}

/** Search videos */
export async function searchVideos(
  query: string,
  options: VideoSearchOptions | undefined,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<PaginatedResult<Video>> {
  const qs = buildQueryString({
    query,
    page: options?.page,
    per_page: options?.perPage ?? DEFAULT_PER_PAGE,
    orientation: options?.orientation,
    size: options?.size,
    locale: options?.locale,
  });
  const url = `${api.baseUrl}/videos/search${qs}`;
  const raw = await fetchPexels<PexelsVideosResponse>(url, api.apiKey, signal);
  return mapVideosPagination(raw);
}

/** Get popular videos */
export async function getPopularVideos(
  options: PaginationOptions | undefined,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<PaginatedResult<Video>> {
  const qs = buildQueryString({
    page: options?.page,
    per_page: options?.perPage ?? DEFAULT_PER_PAGE,
  });
  const url = `${api.baseUrl}/videos/popular${qs}`;
  const raw = await fetchPexels<PexelsVideosResponse>(url, api.apiKey, signal);
  return mapVideosPagination(raw);
}

/** Get a single video by ID */
export async function getVideoById(
  id: number,
  api: PexelsApiOptions,
  signal?: AbortSignal,
): Promise<Video> {
  const url = `${api.baseUrl}/videos/videos/${id}`;
  const raw = await fetchPexels<PexelsVideoRaw>(url, api.apiKey, signal);
  return mapVideo(raw);
}

export { DEFAULT_BASE_URL, DEFAULT_PER_PAGE };
