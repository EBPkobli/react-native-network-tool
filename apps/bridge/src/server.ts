import http from 'http';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSessionStore } from './session-store.js';
import { createRouter } from './routes.js';
import { createSessionRouter } from './session-routes.js';
import { createWebSocketServer, closeAllConnections } from './websocket.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const embeddedDashboardDir = path.resolve(__dirname, '../public/dashboard');

export function startServer(port: number, maxEvents: number = 1000): http.Server {
  const app = express();
  const store = createSessionStore(maxEvents);

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'DELETE'],
      exposedHeaders: ['X-Total-Count'],
    }),
  );
  app.use(express.json({ limit: '512kb' }));

  app.get('/health', (_req, res) => {
    const session = store.getCurrentSession();
    res.json({ status: 'ok', events: store.size(), session: session.id });
  });

  app.use('/api/events', createRouter(store));
  app.use('/api/sessions', createSessionRouter(store));

  if (fs.existsSync(embeddedDashboardDir)) {
    app.use(express.static(embeddedDashboardDir));

    app.get('*', (req, res, next) => {
      if (
        req.path.startsWith('/api/') ||
        req.path === '/health' ||
        req.path === '/ws'
      ) {
        next();
        return;
      }

      res.sendFile(path.join(embeddedDashboardDir, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  createWebSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`[bridge] running at http://localhost:${port}`);
    console.log(`[bridge] WebSocket at  ws://localhost:${port}/ws`);
    if (fs.existsSync(embeddedDashboardDir)) {
      console.log(`[bridge] Dashboard at  http://localhost:${port}`);
    }
  });

  return httpServer;
}

export function stopServer(server: http.Server): Promise<void> {
  closeAllConnections(); // drain WebSocket clients first
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
