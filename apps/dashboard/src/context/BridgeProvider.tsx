import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { reducer, initialState } from '../reducer.js';
import { BridgeContext } from './BridgeContext.js';
import type { NetworkEvent } from '@network-tool/shared';
import type { SessionMeta } from '../types.js';

const MAX_RECONNECT = 5;
const RECONNECT_DELAY_MS = 2000;

interface WsMessage {
  type: string;
  data?: unknown;
}

interface BridgeProviderProps {
  bridgeUrl: string;
  children: ReactNode;
}

export function BridgeProvider({ bridgeUrl, children }: BridgeProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const unmounted = useRef(false);

  const wsUrl = bridgeUrl.replace(/^http/, 'ws') + '/ws';

  const hydrate = useCallback(async () => {
    try {
      const [eventsRes, sessionsRes] = await Promise.all([
        fetch(`${bridgeUrl}/api/events`),
        fetch(`${bridgeUrl}/api/sessions`),
      ]);
      if (eventsRes.ok) {
        const body = (await eventsRes.json()) as { events: NetworkEvent[] };
        dispatch({ type: 'EVENTS_LOADED', payload: body.events });
      }
      if (sessionsRes.ok) {
        const body = (await sessionsRes.json()) as { sessions: SessionMeta[] };
        const sessions = body.sessions;
        const current = sessions[sessions.length - 1] ?? null;
        if (current) {
          dispatch({ type: 'SESSIONS_LOADED', sessions, current });
        }
      }
    } catch {
      // bridge unreachable
    }
  }, [bridgeUrl]);

  const connect = useCallback(() => {
    if (unmounted.current) return;
    dispatch({ type: 'WS_STATUS', status: 'connecting' });

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectCount.current = 0;
      dispatch({ type: 'WS_STATUS', status: 'connected' });
      // Re-hydrate events on every (re)connect so nothing is lost
      void hydrate();
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string) as WsMessage;
        if (msg.type === 'event') {
          dispatch({ type: 'EVENT_RECEIVED', payload: msg.data as NetworkEvent });
        } else if (msg.type === 'clear') {
          dispatch({ type: 'EVENTS_CLEARED' });
        } else if (msg.type === 'session-start') {
          dispatch({ type: 'SESSION_STARTED', session: msg.data as SessionMeta });
        }
      } catch {
        // malformed frame
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      if (unmounted.current) return;
      wsRef.current = null;
      dispatch({ type: 'WS_STATUS', status: 'disconnected' });
      if (reconnectCount.current < MAX_RECONNECT) {
        reconnectCount.current += 1;
        reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }, [wsUrl, hydrate]);

  // WebSocket lifecycle
  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      if (reconnectTimer.current !== null) {
        window.clearTimeout(reconnectTimer.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const manualReconnect = useCallback(() => {
    if (reconnectTimer.current !== null) {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    reconnectCount.current = 0;
    connect();
  }, [connect]);

  return (
    <BridgeContext.Provider value={{ state, dispatch, reconnect: manualReconnect }}>
      {children}
    </BridgeContext.Provider>
  );
}
