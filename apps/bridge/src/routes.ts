import { Router, Request, Response } from 'express';
import { isValidEvent } from '@network-tool/shared';
import type { IEventStore, FilterParams } from './store.js';
import { broadcastEvent, broadcastClear } from './websocket.js';

export function createRouter(store: IEventStore): Router {
  const router = Router();

  // POST /api/events — ingest a captured event from the SDK
  router.post('/', (req: Request, res: Response) => {
    const payload = req.body;
    if (!isValidEvent(payload)) {
      res.status(400).json({ error: 'Invalid event payload' });
      return;
    }
    store.add(payload);
    broadcastEvent(payload);
    res.status(201).json({ ok: true });
  });

  // GET /api/events — list events with optional filtering
  router.get('/', (req: Request, res: Response) => {
    const params: FilterParams = {};
    if (typeof req.query['method'] === 'string') params.method = req.query['method'];
    if (typeof req.query['status'] === 'string') params.status = req.query['status'];
    if (typeof req.query['url'] === 'string') params.url = req.query['url'];

    const hasFilter = params.method !== undefined || params.status !== undefined || params.url !== undefined;
    const events = hasFilter ? store.filter(params) : store.getAll();
    res.setHeader('X-Total-Count', String(events.length));
    res.json({ events, total: events.length });
  });

  // GET /api/events/export — download all events as JSON file
  router.get('/export', (_req: Request, res: Response) => {
    const events = store.getAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="network-events-${Date.now()}.json"`,
    );
    res.json({ exportedAt: new Date().toISOString(), total: events.length, events });
  });

  // DELETE /api/events — clear all stored events
  router.delete('/', (_req: Request, res: Response) => {
    store.clear();
    broadcastClear();
    res.status(204).end();
  });

  return router;
}
