/**
 * NetworkEvent — the single contract between SDK, bridge, and dashboard.
 * Every captured HTTP request/response is normalized into this shape.
 */
export interface NetworkEvent {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Epoch ms when the request started */
  timestamp: number;
  /** HTTP method, uppercased */
  method: string;
  /** Full request URL */
  url: string;

  // Request
  requestHeaders: Record<string, string>;
  requestBody: string | null;

  // Response
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string | null;

  // Timing
  /** Duration in milliseconds from request start to response end */
  duration: number;

  // Meta
  /** true if fetch resolved (even 4xx/5xx); false if network error */
  success: boolean;
  /** Error message if fetch threw; null otherwise */
  error: string | null;
}

/**
 * Configuration for the SDK's NetworkInspector.init() call.
 */
export interface NetworkInspectorConfig {
  /**
   * Full bridge URL, e.g. "http://localhost:8347".
   * Most ergonomic option for local setup.
   */
  bridgeUrl?: string;
  /**
   * Single bridge host, used together with bridgePort.
   * Good for explicit LAN IPs such as "192.168.1.42".
   */
  bridgeHost?: string;
  /**
   * Ordered host candidates. The SDK will try them in order until one works.
   * Helpful for React Native local dev where iOS simulator prefers localhost
   * and Android emulator often needs 10.0.2.2.
   */
  bridgeHosts?: string[];
  /**
   * Port used when bridgeHost / bridgeHosts are provided.
   */
  bridgePort?: number;
  maskedHeaders?: string[];
  maxBodySize?: number;
  enabled?: boolean;
}
