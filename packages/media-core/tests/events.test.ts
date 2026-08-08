// ─────────────────────────────────────────────────────────
// media-core tests — Event Emitter
// ─────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaEventEmitter } from '../src/events/index.js';

describe('MediaEventEmitter', () => {
  let emitter: MediaEventEmitter;

  beforeEach(() => {
    // Suppress console.log from default listeners during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    emitter = new MediaEventEmitter();
  });

  it('should call listener when event is emitted', () => {
    const listener = vi.fn();
    emitter.on('view', listener);

    const payload = { mediaId: 1, mediaType: 'photo' as const, timestamp: Date.now() };
    emitter.emit('view', payload);

    expect(listener).toHaveBeenCalledWith(payload);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should support multiple listeners for the same event', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    emitter.on('view', listener1);
    emitter.on('view', listener2);

    const payload = { mediaId: 1, mediaType: 'photo' as const, timestamp: Date.now() };
    emitter.emit('view', payload);

    expect(listener1).toHaveBeenCalledOnce();
    expect(listener2).toHaveBeenCalledOnce();
  });

  it('should support different event types independently', () => {
    const viewListener = vi.fn();
    const downloadListener = vi.fn();
    emitter.on('view', viewListener);
    emitter.on('download', downloadListener);

    emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });

    expect(viewListener).toHaveBeenCalledOnce();
    expect(downloadListener).not.toHaveBeenCalled();
  });

  it('should unsubscribe via returned function', () => {
    const listener = vi.fn();
    const unsub = emitter.on('view', listener);

    emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce();

    unsub();

    emitter.emit('view', { mediaId: 2, mediaType: 'photo', timestamp: Date.now() });
    expect(listener).toHaveBeenCalledOnce(); // Still 1 — not called again
  });

  it('should have default console listeners', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });

    // Default listener should have logged
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should clean up everything on destroy', () => {
    const listener = vi.fn();
    emitter.on('view', listener);

    emitter.destroy();

    emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should not break when emitting with no listeners', () => {
    const freshEmitter = new MediaEventEmitter();
    freshEmitter.destroy(); // Remove defaults

    expect(() => {
      freshEmitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });
    }).not.toThrow();
  });

  it('should catch listener errors without breaking other listeners', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const badListener = vi.fn(() => { throw new Error('oops'); });
    const goodListener = vi.fn();
    emitter.on('view', badListener);
    emitter.on('view', goodListener);

    emitter.emit('view', { mediaId: 1, mediaType: 'photo', timestamp: Date.now() });

    expect(badListener).toHaveBeenCalledOnce();
    expect(goodListener).toHaveBeenCalledOnce();
  });
});
