// ─────────────────────────────────────────────────────────
// media-core types — Framework-agnostic type contracts
// ─────────────────────────────────────────────────────────

// ─── Photo Types ───

/** Source URLs for a Pexels photo at various sizes */
export interface PhotoSource {
  readonly original: string;
  readonly large2x: string;
  readonly large: string;
  readonly medium: string;
  readonly small: string;
  readonly portrait: string;
  readonly landscape: string;
  readonly tiny: string;
}

/** A photo from the Pexels API */
export interface Photo {
  readonly id: number;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly photographer: string;
  readonly photographerUrl: string;
  readonly photographerId: number;
  readonly avgColor: string;
  readonly src: PhotoSource;
  readonly liked: boolean;
  readonly alt: string;
}

// ─── Video Types ───

/** A single video file variant */
export interface VideoFile {
  readonly id: number;
  readonly quality: string;
  readonly fileType: string;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly link: string;
}

/** A video preview picture */
export interface VideoPicture {
  readonly id: number;
  readonly picture: string;
  readonly nr: number;
}

/** A video from the Pexels API */
export interface Video {
  readonly id: number;
  readonly width: number;
  readonly height: number;
  readonly url: string;
  readonly image: string;
  readonly duration: number;
  readonly user: VideoUser;
  readonly videoFiles: readonly VideoFile[];
  readonly videoPictures: readonly VideoPicture[];
}

/** Video author info */
export interface VideoUser {
  readonly id: number;
  readonly name: string;
  readonly url: string;
}

// ─── Pagination ───

/** Consistent paginated result contract */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly perPage: number;
  readonly totalResults?: number;
  readonly hasNextPage: boolean;
  readonly nextPage?: number;
}

// ─── Search & Query Options ───

/** Orientation filter for photo searches */
export type Orientation = 'landscape' | 'portrait' | 'square';

/** Size filter for photo searches */
export type Size = 'large' | 'medium' | 'small';

/** Supported Pexels locale codes */
export type Locale =
  | 'en-US'
  | 'pt-BR'
  | 'es-ES'
  | 'ca-ES'
  | 'de-DE'
  | 'it-IT'
  | 'fr-FR'
  | 'sv-SE'
  | 'id-ID'
  | 'pl-PL'
  | 'ja-JP'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko-KR'
  | 'th-TH'
  | 'nl-NL'
  | 'hu-HU'
  | 'vi-VN'
  | 'cs-CZ'
  | 'da-DK'
  | 'fi-FI'
  | 'uk-UA'
  | 'el-GR'
  | 'ro-RO'
  | 'nb-NO'
  | 'sk-SK'
  | 'tr-TR'
  | 'ru-RU';

/** Options for paginated requests */
export interface PaginationOptions {
  readonly page?: number;
  readonly perPage?: number;
}

/** Options for photo search */
export interface SearchOptions extends PaginationOptions {
  readonly orientation?: Orientation;
  readonly size?: Size;
  readonly locale?: Locale;
  readonly color?: string;
}

/** Options for video search */
export interface VideoSearchOptions extends PaginationOptions {
  readonly orientation?: Orientation;
  readonly size?: Size;
  readonly locale?: Locale;
}

// ─── Client Configuration ───

/** Configuration for creating a media client */
export interface MediaClientConfig {
  readonly apiKey: string;
  readonly baseUrl?: string;
  /** Cache time-to-live in milliseconds. Default: 5 minutes */
  readonly cacheTtlMs?: number;
}

// ─── Event Types ───

/** Payload for a 'view' event */
export interface ViewEvent {
  readonly mediaId: number;
  readonly mediaType: 'photo' | 'video';
  readonly timestamp: number;
  readonly url?: string;
}

/** Payload for a 'download' event */
export interface DownloadEvent {
  readonly mediaId: number;
  readonly mediaType: 'photo' | 'video';
  readonly timestamp: number;
  readonly url: string;
}

/** Map of event names to their payload types */
export interface MediaEventMap {
  view: ViewEvent;
  download: DownloadEvent;
}

/** Valid event names */
export type MediaEventName = keyof MediaEventMap;

// ─── Media Client Interface ───

/** The public interface of the media SDK client */
export interface MediaClient {
  // Photo API
  search(query: string, options?: SearchOptions): Promise<PaginatedResult<Photo>>;
  getCurated(options?: PaginationOptions): Promise<PaginatedResult<Photo>>;
  getPhoto(id: number): Promise<Photo>;

  // Video API
  searchVideos(query: string, options?: VideoSearchOptions): Promise<PaginatedResult<Video>>;
  getPopularVideos(options?: PaginationOptions): Promise<PaginatedResult<Video>>;
  getVideo(id: number): Promise<Video>;

  // Events
  on<E extends MediaEventName>(
    event: E,
    listener: (payload: MediaEventMap[E]) => void,
  ): () => void;
  emit<E extends MediaEventName>(event: E, payload: MediaEventMap[E]): void;

  // Cache management
  clearCache(): void;

  // Lifecycle
  destroy(): void;
}
