import { buildEvent, buildErrorEvent, readRequestBody } from './event-builder.js';
import { getConfig, getOriginalFetch, processEvent } from './index.js';

// The original global.fetch saved before patching.
// Restored on uninstall. Kept here so uninstallInterceptor can find it.
let _savedFetch: typeof globalThis.fetch | null = null;

/**
 * Install the fetch monkey-patch.
 *
 * Must be called AFTER index.ts has saved originalFetch and created transport.
 * Uses getOriginalFetch() / getConfig() / processEvent() from index.ts.
 */
export function installInterceptor(): void {
  const original = getOriginalFetch();
  if (!original) return; // init() not called or disabled

  _savedFetch = original;

  globalThis.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const config = getConfig();

    // Resolve the URL string for comparison + event building
    const url =
      input instanceof Request
        ? input.url
        : typeof input === 'string'
          ? input
          : input.toString();

    // When fetch(new Request(...)) is used, headers and body live on the
    // Request object, not on init. Merge method + headers into a synthetic
    // init so event building has a consistent source. The body itself is
    // snapshotted separately before fetch consumes it.
    const effectiveInit: RequestInit =
      input instanceof Request
        ? {
            method: input.method,
            headers: input.headers,
            ...init,
          }
        : (init ?? {});

    // Skip interception for bridge-bound requests — prevents infinite loop.
    // We check using the bridge host:port from config.
    if (config) {
      const isBridgeRequest = config.bridgeUrls.some((bridgeUrl) =>
        url.startsWith(bridgeUrl),
      );
      if (isBridgeRequest) {
        return original(input, init);
      }
    }

    const startTime = Date.now();
    const requestBodyPromise = readRequestBody(
      input,
      effectiveInit,
      config?.maxBodySize,
    );

    try {
      const response = await original(input, init);
      const endTime = Date.now();

      // Clone before reading body — app receives the original untouched.
      const responseClone = response.clone();

      // Async event building is fully detached from the return path.
      // Errors here must never propagate to the caller.
      const maxBodySize = config?.maxBodySize;
      buildEvent(
        {
          input,
          url,
          init: effectiveInit,
          requestBodyPromise,
          response: responseClone,
          startTime,
          endTime,
        },
        maxBodySize,
      )
        .then((event) => processEvent(event))
        .catch(() => {
          // Silently swallow — SDK must never crash the host app.
        });

      return response;
    } catch (err: unknown) {
      // Fetch itself rejected (network error, timeout, etc.)
      void buildErrorEvent(
        input,
        url,
        effectiveInit,
        err,
        startTime,
        requestBodyPromise,
        config?.maxBodySize,
      )
        .then((event) => {
          processEvent(event);
        })
        .catch(() => {
          // Silently swallow
        });

      // Re-throw the original error so the app's error handling still works.
      throw err;
    }
  };
}

/**
 * Uninstall the fetch monkey-patch and restore the original fetch.
 */
export function uninstallInterceptor(): void {
  if (_savedFetch) {
    globalThis.fetch = _savedFetch;
    _savedFetch = null;
  }
}
