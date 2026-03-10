import type { NetworkEvent } from './types.js';

/**
 * Replace header values with '[REDACTED]' for headers whose names
 * match the masked list. Matching is case-insensitive.
 */
export function maskHeaders(
  headers: Record<string, string>,
  maskedNames: string[],
): Record<string, string> {
  const lowerMasked = new Set(maskedNames.map((n) => n.toLowerCase()));
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    result[key] = lowerMasked.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }

  return result;
}

/**
 * Pre-computed mask set — build once from the config masked headers list,
 * reuse across every event. Avoids re-allocating a Set per request.
 */
export function buildMaskSet(maskedHeaders: string[]): Set<string> {
  return new Set(maskedHeaders.map((h) => h.toLowerCase()));
}

/**
 * Apply header masking using a pre-built Set (call buildMaskSet once at init).
 * Returns a new event — does not mutate the original.
 */
export function maskEvent(
  event: NetworkEvent,
  maskedHeaders: string[],
): NetworkEvent {
  const lowerMasked = buildMaskSet(maskedHeaders);
  return maskEventWithSet(event, lowerMasked);
}

/**
 * Internal: mask using a pre-built lowercase Set — zero allocation on hot path.
 */
export function maskEventWithSet(
  event: NetworkEvent,
  lowerMasked: Set<string>,
): NetworkEvent {
  return {
    ...event,
    requestHeaders: maskHeadersWithSet(event.requestHeaders, lowerMasked),
    responseHeaders: maskHeadersWithSet(event.responseHeaders, lowerMasked),
  };
}

function maskHeadersWithSet(
  headers: Record<string, string>,
  lowerMasked: Set<string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = lowerMasked.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return result;
}
