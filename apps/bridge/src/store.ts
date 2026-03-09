import type { NetworkEvent } from '@network-tool/shared';

export interface FilterParams {
  method?: string;
  status?: string; // "2xx" | "3xx" | "4xx" | "5xx" | exact code string
  url?: string;
}

/** Shared interface implemented by both createStore and createSessionStore. */
export interface IEventStore {
  add(event: NetworkEvent): void;
  getAll(): NetworkEvent[];
  filter(params: FilterParams): NetworkEvent[];
  clear(): void;
  size(): number;
}

export function matchesStatus(eventStatus: number, param: string): boolean {
  const lower = param.toLowerCase();
  if (lower === '2xx') return eventStatus >= 200 && eventStatus < 300;
  if (lower === '3xx') return eventStatus >= 300 && eventStatus < 400;
  if (lower === '4xx') return eventStatus >= 400 && eventStatus < 500;
  if (lower === '5xx') return eventStatus >= 500 && eventStatus < 600;
  const code = parseInt(param, 10);
  return !isNaN(code) && eventStatus === code;
}

export function filterEvents(
  events: NetworkEvent[],
  params: FilterParams,
): NetworkEvent[] {
  return events.filter((event) => {
    if (params.method && event.method.toLowerCase() !== params.method.toLowerCase()) {
      return false;
    }
    if (params.status && !matchesStatus(event.responseStatus, params.status)) {
      return false;
    }
    if (params.url && !event.url.toLowerCase().includes(params.url.toLowerCase())) {
      return false;
    }
    return true;
  });
}

export function createStore(maxEvents: number = 1000): IEventStore {
  const events: NetworkEvent[] = [];

  return {
    add(event: NetworkEvent): void {
      if (events.length >= maxEvents) {
        events.shift();
      }
      events.push(event);
    },

    getAll(): NetworkEvent[] {
      return [...events];
    },

    filter(params: FilterParams): NetworkEvent[] {
      return filterEvents(events, params);
    },

    clear(): void {
      events.length = 0;
    },

    size(): number {
      return events.length;
    },
  };
}

export type EventStore = ReturnType<typeof createStore>;
