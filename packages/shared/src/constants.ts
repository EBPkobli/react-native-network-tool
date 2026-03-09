export const DEFAULT_BRIDGE_HOST = 'localhost';
export const DEFAULT_BRIDGE_HOSTS = ['localhost', '10.0.2.2', '127.0.0.1'];
export const DEFAULT_BRIDGE_PORT = 8347;
export const DEFAULT_MAX_BODY_SIZE = 65_536; // 64 KB

export const DEFAULT_MASKED_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'proxy-authorization',
  'x-api-key',
  'x-auth-token',
];

export const API_PATHS = {
  EVENTS: '/api/events',
} as const;
