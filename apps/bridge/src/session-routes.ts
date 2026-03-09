import { Router, type Request, type Response } from 'express';
import type { SessionStore } from './session-store.js';
import type { FilterParams } from './store.js';
import { broadcastSessionStart } from './websocket.js';

export function createSessionRouter(store: SessionStore): Router {
  const router = Router();

  // GET /api/sessions — list all sessions (metadata only)
  router.get('/', (_req: Request, res: Response) => {
    const sessions = store.getSessions();
    res.json({ sessions, total: sessions.length });
  });

  // POST /api/sessions — start a new session (ends the current one)
  router.post('/', (req: Request, res: Response) => {
    const name =
      typeof req.body?.name === 'string' ? req.body.name : undefined;
    const session = store.startSession(name);
    broadcastSessionStart(session);
    res.status(201).json({ session });
  });

  // GET /api/sessions/current — quick meta for the active session
  // Must be declared before /:id so Express doesn't treat "current" as an id
  router.get('/current', (_req: Request, res: Response) => {
    res.json({ session: store.getCurrentSession() });
  });

  // GET /api/sessions/:id — full session with events (filterable)
  router.get('/:id', (req: Request, res: Response) => {
    const params: FilterParams = {};
    if (typeof req.query['method'] === 'string') params.method = req.query['method'];
    if (typeof req.query['status'] === 'string') params.status = req.query['status'];
    if (typeof req.query['url'] === 'string') params.url = req.query['url'];

    const hasFilter =
      params.method !== undefined ||
      params.status !== undefined ||
      params.url !== undefined;

    const result = hasFilter
      ? store.filterSession(req.params.id as string, params)
      : store.getSession(req.params.id as string);

    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session: result.meta, events: result.events, total: result.events.length });
  });

  // GET /api/sessions/:id/export — download session as JSON file
  router.get('/:id/export', (req: Request, res: Response) => {
    const result = store.getSession(req.params.id as string);
    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="session-${result.meta.id}-${Date.now()}.json"`,
    );
    res.json({
      exportedAt: new Date().toISOString(),
      session: result.meta,
      total: result.events.length,
      events: result.events,
    });
  });

  return router;
}
