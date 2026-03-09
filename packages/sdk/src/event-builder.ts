import type { NetworkEvent } from '@network-tool/shared';
import { DEFAULT_MAX_BODY_SIZE } from '@network-tool/shared';

// ─── ID generation ───────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Header helpers ──────────────────────────────────────────

export function headersToRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Safely convert a HeadersInit (the type accepted by fetch) into
 * a plain Record. Handles Headers, array-of-tuples, and object forms.
 */
export function headerInitToRecord(
  init: HeadersInit | undefined,
): Record<string, string> {
  if (!init) return {};
  if (init instanceof Headers) return headersToRecord(init);
  if (Array.isArray(init)) {
    const result: Record<string, string> = {};
    for (const [key, value] of init) {
      if (key !== undefined && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }
  // Plain object
  return { ...init };
}

// ─── Body helpers ────────────────────────────────────────────

export function truncateBody(body: string, maxSize: number): string {
  if (body.length <= maxSize) return body;
  return body.slice(0, maxSize) + `...[truncated, ${body.length} bytes total]`;
}

const BINARY_CONTENT_PREFIXES = [
  'image/',
  'audio/',
  'video/',
  'application/octet-stream',
  'application/zip',
  'application/pdf',
];

export function isBinaryContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return BINARY_CONTENT_PREFIXES.some((prefix) => lower.includes(prefix));
}

export function isMultipartContentType(contentType: string | null): boolean {
  return contentType?.toLowerCase().includes('multipart/form-data') ?? false;
}

/**
 * Serialize a request body (the value passed to fetch's `init.body`)
 * into a string suitable for the event model.
 */
export function serializeBody(
  body: unknown,
  maxSize: number = DEFAULT_MAX_BODY_SIZE,
): string | null {
  if (body === null || body === undefined) return null;
  if (typeof body === 'string') return truncateBody(body, maxSize);

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return '[FormData]';
  }
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    return `[Binary, ${body.byteLength} bytes]`;
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return `[Binary, ${body.size} bytes]`;
  }

  // Likely a JSON-serializable object
  try {
    const json = JSON.stringify(body);
    return truncateBody(json, maxSize);
  } catch {
    return '[Unserializable body]';
  }
}

export async function readRequestBody(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  maxSize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<string | null> {
  if (init?.body !== undefined) {
    return serializeBody(init.body, maxSize);
  }

  if (!(input instanceof Request)) {
    return null;
  }

  try {
    const requestClone = input.clone();
    const contentType = requestClone.headers.get('content-type');
    if (isMultipartContentType(contentType)) {
      return '[FormData]';
    }
    if (isBinaryContentType(contentType)) {
      const contentLength = requestClone.headers.get('content-length');
      return `[Binary request, ${contentLength ?? 'unknown'} bytes]`;
    }

    const text = await requestClone.text();
    return text.length > 0 ? truncateBody(text, maxSize) : null;
  } catch {
    return null;
  }
}

/**
 * Read body text from a Response (must be a clone — original stays untouched).
 * Returns null if reading fails for any reason.
 */
export async function readResponseBody(
  response: Response,
  maxSize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<string | null> {
  try {
    const contentType = response.headers.get('content-type');
    if (isBinaryContentType(contentType)) {
      const length = response.headers.get('content-length');
      return `[Binary response, ${length ?? 'unknown'} bytes]`;
    }
    const text = await response.text();
    return truncateBody(text, maxSize);
  } catch {
    return null;
  }
}

// ─── Event building ──────────────────────────────────────────

/**
 * Raw data captured by the fetch interceptor.
 * Passed to buildEvent() for normalization.
 */
export interface RawRequestData {
  input: RequestInfo | URL;
  url: string;
  init?: RequestInit;
  requestBodyPromise?: Promise<string | null>;
  response: Response;
  startTime: number;
  endTime: number;
}

/**
 * Build a NetworkEvent from a successful fetch call.
 * The response must already be cloned by the caller.
 */
export async function buildEvent(
  raw: RawRequestData,
  maxBodySize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<NetworkEvent> {
  const { input, url, init, requestBodyPromise, response, startTime, endTime } =
    raw;

  const requestHeaders = headerInitToRecord(init?.headers);
  const requestBody = requestBodyPromise
    ? await requestBodyPromise
    : await readRequestBody(input, init, maxBodySize);
  const responseBody = await readResponseBody(response, maxBodySize);

  return {
    id: generateId(),
    timestamp: startTime,
    method: (init?.method ?? 'GET').toUpperCase(),
    url,
    requestHeaders,
    requestBody,
    responseStatus: response.status,
    responseHeaders: headersToRecord(response.headers),
    responseBody,
    duration: endTime - startTime,
    success: true,
    error: null,
  };
}

/**
 * Build a NetworkEvent for a failed fetch (network error, timeout, etc.).
 */
export function buildErrorEvent(
  input: RequestInfo | URL,
  url: string,
  init: RequestInit | undefined,
  error: unknown,
  startTime: number,
  requestBodyPromise?: Promise<string | null>,
  maxBodySize: number = DEFAULT_MAX_BODY_SIZE,
): Promise<NetworkEvent> {
  const message =
    error instanceof Error ? error.message : String(error);

  const readBody =
    requestBodyPromise ?? readRequestBody(input, init, maxBodySize);

  return readBody.then((requestBody) => ({
    id: generateId(),
    timestamp: startTime,
    method: (init?.method ?? 'GET').toUpperCase(),
    url,
    requestHeaders: headerInitToRecord(init?.headers),
    requestBody,
    responseStatus: 0,
    responseHeaders: {},
    responseBody: null,
    duration: Date.now() - startTime,
    success: false,
    error: message,
  }));
}
