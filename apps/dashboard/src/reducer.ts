import type { NetworkEvent } from '@network-tool/shared';
import type { AppState, ConnectionStatus, SessionMeta } from './types.js';

export type Action =
  | { type: 'EVENT_RECEIVED'; payload: NetworkEvent }
  | { type: 'EVENTS_LOADED'; payload: NetworkEvent[] }
  | { type: 'EVENT_SELECTED'; id: string | null }
  | { type: 'FILTER_METHOD'; method: string | null }
  | { type: 'FILTER_STATUS'; status: string | null }
  | { type: 'FILTER_URL'; url: string }
  | { type: 'EVENTS_CLEARED' }
  | { type: 'WS_STATUS'; status: ConnectionStatus }
  | { type: 'SESSIONS_LOADED'; sessions: SessionMeta[]; current: SessionMeta }
  | { type: 'SESSION_STARTED'; session: SessionMeta };

export const initialState: AppState = {
  events: [],
  selectedId: null,
  filters: { method: null, status: null, url: '' },
  connectionStatus: 'connecting',
  currentSession: null,
  sessions: [],
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'EVENT_RECEIVED': {
      // Dedup: skip if an event with the same id already exists
      if (state.events.some((e) => e.id === action.payload.id)) {
        return state;
      }
      return { ...state, events: [action.payload, ...state.events] };
    }
    case 'EVENTS_LOADED': {
      // Dedup by id, newest first
      const seen = new Set<string>();
      const unique = action.payload.filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
      unique.reverse();
      return { ...state, events: unique };
    }
    case 'EVENT_SELECTED':
      return { ...state, selectedId: action.id };
    case 'FILTER_METHOD':
      return { ...state, filters: { ...state.filters, method: action.method } };
    case 'FILTER_STATUS':
      return { ...state, filters: { ...state.filters, status: action.status } };
    case 'FILTER_URL':
      return { ...state, filters: { ...state.filters, url: action.url } };
    case 'EVENTS_CLEARED':
      return { ...state, events: [], selectedId: null };
    case 'WS_STATUS':
      return { ...state, connectionStatus: action.status };
    case 'SESSIONS_LOADED':
      return { ...state, sessions: action.sessions, currentSession: action.current };
    case 'SESSION_STARTED':
      return {
        ...state,
        sessions: [...state.sessions, action.session],
        currentSession: action.session,
        // Keep existing events — don't clear on session change
      };
  }
}
