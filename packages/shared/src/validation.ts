import type { NetworkEvent } from './types.js';

/**
 * Lightweight runtime check that an unknown value looks like a NetworkEvent.
 * Used by the bridge to validate incoming payloads.
 */
export function isValidEvent(data: unknown): data is NetworkEvent {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj['id'] === 'string' &&
    typeof obj['timestamp'] === 'number' &&
    typeof obj['method'] === 'string' &&
    typeof obj['url'] === 'string' &&
    typeof obj['requestHeaders'] === 'object' &&
    typeof obj['responseStatus'] === 'number' &&
    typeof obj['responseHeaders'] === 'object' &&
    typeof obj['duration'] === 'number' &&
    typeof obj['success'] === 'boolean'
  );
}
