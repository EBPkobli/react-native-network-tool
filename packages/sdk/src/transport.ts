import type { NetworkEvent } from './types.js';
import { API_PATHS } from '@network-tool/shared';

/**
 * Transport interface — abstraction for sending events to the bridge.
 * Default implementation uses HTTP POST. Can be replaced for testing
 * or alternative transports (e.g. WebSocket) in the future.
 */
export interface Transport {
  send(event: NetworkEvent): void;
}

/**
 * Create an HTTP transport that POSTs events to the bridge.
 *
 * Accepts an `originalFetch` reference — this MUST be the un-patched
 * global fetch, captured before the interceptor is installed.
 * This prevents infinite recursion (transport calling patched fetch
 * which triggers another event which calls transport...).
 *
 * All errors are silently swallowed. Transport never throws, never blocks.
 */
export function createHttpTransport(
  baseUrls: string[],
  originalFetch: typeof globalThis.fetch,
): Transport {
  const candidates = [...new Set(baseUrls.map((url) => url.replace(/\/+$/, '')))];
  let preferredIndex = 0;

  return {
    send(event: NetworkEvent): void {
      const orderedCandidates = candidates.map((_, offset) => {
        return candidates[(preferredIndex + offset) % candidates.length]!;
      });

      void (async () => {
        for (const [index, baseUrl] of orderedCandidates.entries()) {
          try {
            const response = await originalFetch(`${baseUrl}${API_PATHS.EVENTS}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(event),
            });

            if (!response.ok) {
              continue;
            }

            preferredIndex = (preferredIndex + index) % candidates.length;
            return;
          } catch {
            // Try the next configured bridge candidate.
          }
        }
      })().catch(() => {
        // Silently ignore — bridge may not be running yet.
        // SDK must never interfere with the host app.
      });
    },
  };
}
