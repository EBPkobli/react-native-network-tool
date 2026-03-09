import type { NetworkEvent, NetworkInspectorConfig } from '@network-tool/shared';
import {
  DEFAULT_BRIDGE_HOST,
  DEFAULT_BRIDGE_HOSTS,
  DEFAULT_BRIDGE_PORT,
  DEFAULT_MAX_BODY_SIZE,
  DEFAULT_MASKED_HEADERS,
} from '@network-tool/shared';
import { maskEventWithSet, buildMaskSet } from './masking.js';
import { createHttpTransport, type Transport } from './transport.js';
import { installInterceptor, uninstallInterceptor } from './interceptor.js';

// ─── Internal state ──────────────────────────────────────────

type ResolvedNetworkInspectorConfig = {
  bridgeUrls: string[];
  maskedHeaders: string[];
  maxBodySize: number;
  enabled: boolean;
};

let currentConfig: ResolvedNetworkInspectorConfig | null = null;
let transport: Transport | null = null;
let originalFetch: typeof globalThis.fetch | null = null;
let maskSet: Set<string> | null = null; // pre-built from config.maskedHeaders

// ─── Config resolution ───────────────────────────────────────

function normalizeBridgeUrl(value: string): string {
  const trimmed = value.trim();
  const withProtocol =
    /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  const parsed = new URL(withProtocol);
  return parsed.toString().replace(/\/+$/, '');
}

function resolveBridgeUrls(config?: NetworkInspectorConfig): string[] {
  if (config?.bridgeUrl) {
    return [normalizeBridgeUrl(config.bridgeUrl)];
  }

  const bridgePort = config?.bridgePort ?? DEFAULT_BRIDGE_PORT;
  const configuredHosts =
    config?.bridgeHosts && config.bridgeHosts.length > 0
      ? config.bridgeHosts
      : config?.bridgeHost
        ? [config.bridgeHost]
        : DEFAULT_BRIDGE_HOSTS;

  return [...new Set(configuredHosts)]
    .map((host) => host.trim())
    .filter(Boolean)
    .map((host) => normalizeBridgeUrl(`${host}:${bridgePort}`));
}

function resolveConfig(config?: NetworkInspectorConfig): ResolvedNetworkInspectorConfig {
  return {
    bridgeUrls:
      resolveBridgeUrls(config).length > 0
        ? resolveBridgeUrls(config)
        : [normalizeBridgeUrl(`${DEFAULT_BRIDGE_HOST}:${DEFAULT_BRIDGE_PORT}`)],
    maskedHeaders: config?.maskedHeaders ?? [...DEFAULT_MASKED_HEADERS],
    maxBodySize: config?.maxBodySize ?? DEFAULT_MAX_BODY_SIZE,
    enabled: config?.enabled ?? true,
  };
}

// ─── Public API ──────────────────────────────────────────────

export const NetworkInspector = {
  /**
   * Start capturing network requests.
   * Call once at app startup, typically in index.js or App.tsx.
   *
   * All config fields are optional — sensible defaults are provided.
   * Pass `enabled: false` (or `enabled: __DEV__`) to auto-disable in production.
   */
  init(config?: NetworkInspectorConfig): void {
    const resolved = resolveConfig(config);

    if (!resolved.enabled) return;

    // Guard against double-init (hot reload, Expo fast refresh).
    // If already active, disable cleanly first so originalFetch is preserved correctly.
    if (currentConfig !== null) {
      NetworkInspector.disable();
    }

    // Save original fetch BEFORE any interceptor is installed.
    // This reference is used by transport to avoid infinite recursion.
    originalFetch = globalThis.fetch;

    currentConfig = resolved;
    transport = createHttpTransport(resolved.bridgeUrls, originalFetch);

    installInterceptor();
    maskSet = buildMaskSet(resolved.maskedHeaders);
  },

  /**
   * Stop capturing and restore original fetch.
   */
  disable(): void {
    uninstallInterceptor();
    currentConfig = null;
    transport = null;
    originalFetch = null;
    maskSet = null;
  },

  /**
   * Returns true if the inspector is currently capturing.
   */
  isEnabled(): boolean {
    return currentConfig !== null;
  },
};

// ─── Internal helpers (used by interceptor in next phase) ────

/**
 * Process a captured event: apply masking, then send via transport.
 * Called by the interceptor after building a NetworkEvent.
 */
export function processEvent(event: NetworkEvent): void {
  if (!currentConfig || !transport || !maskSet) return;

  const masked = maskEventWithSet(event, maskSet);
  transport.send(masked);
}

/** Get current config (for interceptor). */
export function getConfig(): ResolvedNetworkInspectorConfig | null {
  return currentConfig;
}

/** Get saved original fetch ref (for interceptor to skip its own URL). */
export function getOriginalFetch(): typeof globalThis.fetch | null {
  return originalFetch;
}
