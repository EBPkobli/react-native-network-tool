import { useMemo } from 'react';
import type { NetworkEvent } from '@network-tool/shared';
import type { FilterState, DecoratedEvent } from '../types';

const SLOW_MS = 3000;

export function useFilteredEvents(
  events: NetworkEvent[],
  filters: FilterState,
): DecoratedEvent[] {
  const { method, status, url } = filters;

  return useMemo(() => {
    const seen = new Map<string, boolean>(); // duplicate key → seen flag

    return events
      .filter((evt) => {
        if (
          method &&
          evt.method.toLowerCase() !== method.toLowerCase()
        ) {
          return false;
        }
        if (status) {
          const s = status.toLowerCase();
          const code = evt.responseStatus;
          let match = false;
          if (s === '2xx') match = code >= 200 && code < 300;
          else if (s === '3xx') match = code >= 300 && code < 400;
          else if (s === '4xx') match = code >= 400 && code < 500;
          else if (s === '5xx') match = code >= 500 && code < 600;
          else match = code === parseInt(s, 10);
          if (!match) return false;
        }
        if (
          url &&
          !evt.url.toLowerCase().includes(url.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((evt) => {
        let key: string;
        try {
          const parsed = new URL(
            evt.url.includes('://') ? evt.url : `http://${evt.url}`,
          );
          key = `${evt.method}:${parsed.hostname}${parsed.pathname}`;
        } catch {
          key = `${evt.method}:${evt.url}`;
        }
        const isDuplicate = seen.has(key);
        if (!isDuplicate) seen.set(key, true);
        return { ...evt, isDuplicate, isSlow: evt.duration >= SLOW_MS };
      });
  }, [events, method, status, url]);
}
