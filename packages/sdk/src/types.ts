export interface NetworkEvent {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: string | null;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string | null;
  duration: number;
  success: boolean;
  error: string | null;
}

export interface NetworkInspectorConfig {
  bridgeUrl?: string;
  bridgeHost?: string;
  bridgeHosts?: string[];
  bridgePort?: number;
  maskedHeaders?: string[];
  maxBodySize?: number;
  enabled?: boolean;
}
