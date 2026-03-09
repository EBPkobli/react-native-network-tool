import type { NetworkEvent } from '@network-tool/shared';
import { filterEvents } from './store.js';
import type { FilterParams, IEventStore } from './store.js';

export interface SessionMeta {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number | null;
  eventCount: number;
}

interface StoredSession extends SessionMeta {
  events: NetworkEvent[];
}

function toMeta(s: StoredSession): SessionMeta {
  return {
    id: s.id,
    name: s.name,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    eventCount: s.events.length,
  };
}

function makeSession(name: string): StoredSession {
  return {
    id: crypto.randomUUID(),
    name,
    startedAt: Date.now(),
    endedAt: null,
    eventCount: 0,
    events: [],
  };
}

export interface SessionStore extends IEventStore {
  startSession(name?: string): SessionMeta;
  getCurrentSession(): SessionMeta;
  getSessions(): SessionMeta[];
  getSession(id: string): { meta: SessionMeta; events: NetworkEvent[] } | null;
  filterSession(id: string, params: FilterParams): { meta: SessionMeta; events: NetworkEvent[] } | null;
}

export function createSessionStore(
  maxEvents: number = 1000,
  maxSessions: number = 20,
): SessionStore {
  const archive: StoredSession[] = [];
  let current: StoredSession = makeSession('Session 1');

  return {
    // ── IEventStore — operates on current session ─────────────────────────────

    add(event: NetworkEvent): void {
      if (current.events.length >= maxEvents) {
        current.events.shift(); // ring buffer
      }
      current.events.push(event);
      current.eventCount = current.events.length;
    },

    getAll(): NetworkEvent[] {
      return [...current.events];
    },

    filter(params: FilterParams): NetworkEvent[] {
      return filterEvents(current.events, params);
    },

    clear(): void {
      current.events.length = 0;
      current.eventCount = 0;
    },

    size(): number {
      return current.events.length;
    },

    // ── Session management ────────────────────────────────────────────────────

    startSession(name?: string): SessionMeta {
      current.endedAt = Date.now();
      if (archive.length >= maxSessions) {
        archive.shift(); // drop oldest archived session
      }
      archive.push(current);
      current = makeSession(name?.trim() || `Session ${archive.length + 1}`);
      return toMeta(current);
    },

    getCurrentSession(): SessionMeta {
      return toMeta(current);
    },

    getSessions(): SessionMeta[] {
      return [...archive.map(toMeta), toMeta(current)];
    },

    getSession(id: string): { meta: SessionMeta; events: NetworkEvent[] } | null {
      if (current.id === id) {
        return { meta: toMeta(current), events: [...current.events] };
      }
      const archived = archive.find((s) => s.id === id);
      if (!archived) return null;
      return { meta: toMeta(archived), events: [...archived.events] };
    },

    filterSession(
      id: string,
      params: FilterParams,
    ): { meta: SessionMeta; events: NetworkEvent[] } | null {
      const result = this.getSession(id);
      if (!result) return null;
      return { meta: result.meta, events: filterEvents(result.events, params) };
    },
  };
}
