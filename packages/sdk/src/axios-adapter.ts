import type { NetworkEvent } from '@network-tool/shared';
import { DEFAULT_MAX_BODY_SIZE } from '@network-tool/shared';
import { generateId, serializeBody, truncateBody, isBinaryContentType } from './event-builder.js';
import { processEvent } from './index.js';

// ─── Axios duck-typed interfaces ─────────────────────────────
//
// We do NOT import from 'axios' — it must not be an SDK dependency.
// These structural types describe the subset of axios internals we use.
// They are compatible with axios v0.x, v1.x.

interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string | number | boolean | null | undefined>;
  data?: unknown;
  params?: unknown;
  // Internal: attached by our request interceptor so response/error can measure duration
  _networkToolStartTime?: number;
}

interface AxiosResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  data: unknown;
  config: AxiosRequestConfig;
}

interface AxiosError {
  isAxiosError: true;
  message: string;
  config?: AxiosRequestConfig;
  response?: AxiosResponse;
}

/** Minimal shape of an axios instance we need for interceptor attachment. */
interface AxiosInstance {
  interceptors: {
    request: {
      use(
        onFulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig,
      ): number;
    };
    response: {
      use(
        onFulfilled: (response: AxiosResponse) => AxiosResponse,
        onRejected: (error: unknown) => never,
      ): number;
    };
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function resolveFullUrl(config: AxiosRequestConfig): string {
  const base = config.baseURL ?? '';
  const path = config.url ?? '';
  if (!base) return path;
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

function headersToRecord(
  headers: Record<string, string | string[] | number | boolean | null | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === null || value === undefined) continue;
    result[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return result;
}

function serializeAxiosResponseBody(
  data: unknown,
  contentType: string | undefined,
  maxSize: number,
): string | null {
  if (data === null || data === undefined) return null;

  if (typeof contentType === 'string' && isBinaryContentType(contentType)) {
    return '[Binary response]';
  }

  if (typeof data === 'string') {
    return truncateBody(data, maxSize);
  }

  // axios already parsed JSON — re-serialize so the dashboard can show it
  try {
    return truncateBody(JSON.stringify(data), maxSize);
  } catch {
    return '[Unserializable response]';
  }
}

// ─── Event builders ───────────────────────────────────────────

function buildAxiosSuccessEvent(
  response: AxiosResponse,
  startTime: number,
  maxBodySize: number,
): NetworkEvent {
  const config = response.config;
  const endTime = Date.now();
  const responseHeaders = headersToRecord(
    response.headers as Record<string, string | string[] | undefined>,
  );
  const contentType = responseHeaders['content-type'];

  return {
    id: generateId(),
    timestamp: startTime,
    method: (config.method ?? 'GET').toUpperCase(),
    url: resolveFullUrl(config),
    requestHeaders: headersToRecord(
      (config.headers ?? {}) as Record<string, string | undefined>,
    ),
    requestBody: serializeBody(config.data, maxBodySize),
    responseStatus: response.status,
    responseHeaders,
    responseBody: serializeAxiosResponseBody(response.data, contentType, maxBodySize),
    duration: endTime - startTime,
    success: true,
    error: null,
  };
}

function buildAxiosErrorEvent(
  error: AxiosError,
  startTime: number,
  maxBodySize: number,
): NetworkEvent {
  const config = error.config ?? {};
  const endTime = Date.now();

  // AxiosError with a response means the server replied (4xx/5xx)
  if (error.response) {
    const responseHeaders = headersToRecord(
      error.response.headers as Record<string, string | string[] | undefined>,
    );
    const contentType = responseHeaders['content-type'];
    return {
      id: generateId(),
      timestamp: startTime,
      method: (config.method ?? 'GET').toUpperCase(),
      url: resolveFullUrl(config),
      requestHeaders: headersToRecord(
        (config.headers ?? {}) as Record<string, string | undefined>,
      ),
      requestBody: serializeBody(config.data, maxBodySize),
      responseStatus: error.response.status,
      responseHeaders,
      responseBody: serializeAxiosResponseBody(error.response.data, contentType, maxBodySize),
      duration: endTime - startTime,
      success: false,
      error: error.message,
    };
  }

  // Network error — no response
  return {
    id: generateId(),
    timestamp: startTime,
    method: (config.method ?? 'GET').toUpperCase(),
    url: resolveFullUrl(config),
    requestHeaders: headersToRecord(
      (config.headers ?? {}) as Record<string, string | undefined>,
    ),
    requestBody: serializeBody(config.data, maxBodySize),
    responseStatus: 0,
    responseHeaders: {},
    responseBody: null,
    duration: endTime - startTime,
    success: false,
    error: error.message,
  };
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Attach network inspection interceptors to an existing axios instance.
 *
 * This is opt-in — call it manually with your axios instance. The SDK
 * fetch interceptor is NOT affected and continues to work independently.
 *
 * axios must NOT be installed as a dependency of this SDK package.
 * This function accepts any object that structurally matches AxiosInstance.
 *
 * @example
 *   import axios from 'axios';
 *   import { attachAxiosInterceptor } from '@network-tool/sdk/axios';
 *   attachAxiosInterceptor(axios);
 *
 *   // Or with a custom instance:
 *   const api = axios.create({ baseURL: 'https://api.example.com' });
 *   attachAxiosInterceptor(api);
 */
export function attachAxiosInterceptor(
  axiosInstance: AxiosInstance,
  options: { maxBodySize?: number } = {},
): void {
  const maxBodySize = options.maxBodySize ?? DEFAULT_MAX_BODY_SIZE;

  // Request interceptor — attach start time to config
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    config._networkToolStartTime = Date.now();
    return config;
  });

  // Response interceptor — handle success and error
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      const startTime = response.config._networkToolStartTime ?? Date.now();
      try {
        const event = buildAxiosSuccessEvent(response, startTime, maxBodySize);
        processEvent(event);
      } catch {
        // Silently swallow — never interfere with the axios response
      }
      return response;
    },
    (error: unknown): never => {
      if (
        error !== null &&
        typeof error === 'object' &&
        'isAxiosError' in error &&
        (error as AxiosError).isAxiosError === true
      ) {
        const axiosError = error as AxiosError;
        const startTime = axiosError.config?._networkToolStartTime ?? Date.now();
        try {
          const event = buildAxiosErrorEvent(axiosError, startTime, maxBodySize);
          processEvent(event);
        } catch {
          // Silently swallow
        }
      }
      throw error;
    },
  );
}
