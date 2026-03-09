import { WebSocketServer, WebSocket, type Server as WsServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server as HttpServer } from 'http';
import type { NetworkEvent } from '@network-tool/shared';
import type { SessionMeta } from './session-store.js';

const connected = new Set<WebSocket>();
let wss: WsServer | null = null;

export function createWebSocketServer(httpServer: HttpServer): void {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    connected.add(ws);

    ws.on('close', () => {
      connected.delete(ws);
    });

    ws.on('error', () => {
      connected.delete(ws);
    });
  });
}

export function broadcastEvent(event: NetworkEvent): void {
  send({ type: 'event', data: event });
}

export function broadcastClear(): void {
  send({ type: 'clear' });
}

export function broadcastSessionStart(session: SessionMeta): void {
  send({ type: 'session-start', data: session });
}

export function closeAllConnections(): void {
  for (const ws of connected) {
    try {
      ws.close();
    } catch {
      // ignore — socket may already be gone
    }
  }
  connected.clear();
}

function send(message: object): void {
  const frame = JSON.stringify(message);
  for (const ws of connected) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(frame);
      } catch {
        // socket may have died between readyState check and send
        connected.delete(ws);
      }
    }
  }
}
