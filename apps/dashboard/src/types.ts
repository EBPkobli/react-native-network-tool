import type { NetworkEvent } from '@network-tool/shared';

export type { NetworkEvent };

export interface DecoratedEvent extends NetworkEvent {
  isDuplicate: boolean;
  isSlow: boolean;
}

export interface SessionMeta {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number | null;
  eventCount: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface FilterState {
  method: string | null;
  status: string | null;
  url: string;
}

export interface AppState {
  events: NetworkEvent[];
  selectedId: string | null;
  filters: FilterState;
  connectionStatus: ConnectionStatus;
  currentSession: SessionMeta | null;
  sessions: SessionMeta[];
}
