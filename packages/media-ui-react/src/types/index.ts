// ─────────────────────────────────────────────────────────
// media-ui-react types — Generic types for headless components
// ─────────────────────────────────────────────────────────
//
// IMPORTANT: These types must NOT reference Pexels, media-core,
// or any SDK types. The UI library is completely independent.
// ─────────────────────────────────────────────────────────

import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

/** Props that can be spread onto a container div */
export type ContainerProps = HTMLAttributes<HTMLDivElement>;

/** Props that can be spread onto a button element */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** A generic media item — the consumer maps SDK types to this */
export interface MediaItemBase {
  readonly id: string | number;
}
