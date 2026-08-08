// ─────────────────────────────────────────────────────────
// media-core events — Typed event emitter
// ─────────────────────────────────────────────────────────
//
// Design: A lightweight, strongly-typed event emitter.
// Uses a typed event map so subscribers get compile-time
// safety on event names and payload shapes.
// Framework-agnostic — no DOM, no React, no Node EventEmitter.
// ─────────────────────────────────────────────────────────

import type { MediaEventMap, MediaEventName } from '../types/index.js';

/** Listener function for a specific event */
type Listener<E extends MediaEventName> = (payload: MediaEventMap[E]) => void;

/**
 * A small, typed, framework-agnostic event emitter.
 *
 * Supports:
 * - Strongly typed event names and payloads
 * - Multiple listeners per event
 * - Unsubscribe via returned function or explicit call
 * - Default console listener for activity logging
 * - destroy() for cleanup
 *
 * @example
 * ```ts
 * const emitter = new MediaEventEmitter();
 * const unsub = emitter.on('view', (event) => console.log(event));
 * emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });
 * unsub(); // clean up
 * ```
 */
export class MediaEventEmitter {
  private listeners: {
    [E in MediaEventName]?: Set<Listener<E>>;
  } = {};

  private defaultUnsubscribers: Array<() => void> = [];

  constructor() {
    // Register default console listeners as required by the assignment
    this.defaultUnsubscribers.push(
      this.on('view', (event) => {
        console.log(`[MediaSDK] view event:`, event);
      }),
    );
    this.defaultUnsubscribers.push(
      this.on('download', (event) => {
        console.log(`[MediaSDK] download event:`, event);
      }),
    );
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on<E extends MediaEventName>(event: E, listener: Listener<E>): () => void {
    let set = this.listeners[event] as Set<Listener<E>> | undefined;
    if (!set) {
      set = new Set<Listener<E>>();
      (this.listeners as Record<string, Set<Listener<E>>>)[event] = set;
    }
    set.add(listener);

    return () => {
      set.delete(listener);
    };
  }

  /**
   * Emit an event to all registered listeners.
   */
  emit<E extends MediaEventName>(event: E, payload: MediaEventMap[E]): void {
    const set = this.listeners[event] as Set<Listener<E>> | undefined;
    if (!set) return;
    for (const listener of set) {
      try {
        listener(payload);
      } catch (err) {
        // Don't let listener errors break the emitter
        console.error(`[MediaSDK] Error in ${event} listener:`, err);
      }
    }
  }

  /**
   * Remove all listeners and clean up.
   */
  destroy(): void {
    this.defaultUnsubscribers.forEach((unsub) => unsub());
    this.defaultUnsubscribers = [];
    for (const key of Object.keys(this.listeners) as MediaEventName[]) {
      this.listeners[key]?.clear();
    }
    this.listeners = {};
  }
}
