import { useState } from 'react';
import { useBridge } from '../context/BridgeContext.js';
import { useCopyText } from '../hooks/useCopyText.js';
import { JsonViewer } from './JsonViewer.js';
import type { NetworkEvent } from '@network-tool/shared';

function exportEventAsJson(event: NetworkEvent): void {
  const exportData = {
    general: {
      url: event.url,
      method: event.method,
      status: event.responseStatus,
      duration: event.duration,
      success: event.success,
      error: event.error,
      timestamp: event.timestamp,
    },
    requestHeaders: event.requestHeaders,
    responseHeaders: event.responseHeaders,
    requestBody: safeParseJson(event.requestBody),
    responseBody: safeParseJson(event.responseBody),
    timing: {
      startedAt: new Date(event.timestamp).toISOString(),
      duration: event.duration,
    },
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.method}-${new URL(event.url.includes('://') ? event.url : `http://${event.url}`).pathname.replace(/\//g, '_').slice(1) || 'request'}-${event.id.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeParseJson(data: string | null): unknown {
  if (!data) return null;
  try { return JSON.parse(data); } catch { return data; }
}

type Tab = 'general' | 'headers' | 'payload' | 'response' | 'timing';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'headers', label: 'Headers' },
  { id: 'payload', label: 'Payload' },
  { id: 'response', label: 'Response' },
  { id: 'timing', label: 'Timing' },
];

function statusDot(code: number): string {
  if (code >= 200 && code < 300) return 'bg-green-500';
  if (code >= 300 && code < 400) return 'bg-amber-500';
  if (code >= 400) return 'bg-red-500';
  return 'bg-slate-500';
}

function statusLabel(code: number): string {
  if (code === 0) return 'Network Error';
  const labels: Record<number, string> = {
    200: '200 OK',
    201: '201 Created',
    204: '204 No Content',
    301: '301 Moved',
    304: '304 Not Modified',
    400: '400 Bad Request',
    401: '401 Unauthorized',
    403: '403 Forbidden',
    404: '404 Not Found',
    500: '500 Internal Server Error',
    502: '502 Bad Gateway',
    503: '503 Service Unavailable',
  };
  return labels[code] ?? String(code);
}

export function DetailPanel() {
  const { state, dispatch } = useBridge();
  const [tab, setTab] = useState<Tab>('general');

  const event = state.events.find((e) => e.id === state.selectedId);
  if (!event) return null;

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#f5f7f8] dark:bg-[#101722]">
      {/* Tabs */}
      <div className="flex items-center px-6 pt-4 border-b border-slate-200 dark:border-slate-800 gap-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === t.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto pb-3 flex items-center gap-2">
          <button
            onClick={() => exportEventAsJson(event)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
            title="Export all request data as JSON"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export JSON
          </button>
          <button
            onClick={() => dispatch({ type: 'EVENT_SELECTED', id: null })}
            className="text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="space-y-8 max-w-4xl">
          {tab === 'general' && <GeneralTab event={event} />}
          {tab === 'headers' && <HeadersTab event={event} />}
          {tab === 'payload' && <PayloadTab event={event} />}
          {tab === 'response' && <ResponseTab event={event} />}
          {tab === 'timing' && <TimingTab event={event} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          <strong className="text-slate-300">{event.method}</strong>{' '}
          {event.duration}ms
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(event.responseStatus)}`} />
          {statusLabel(event.responseStatus)}
        </span>
      </footer>
    </main>
  );
}

/* ── General Tab ─────────────────────────────────────────── */
function GeneralTab({ event }: { event: NetworkEvent }) {
  const { copy, copied } = useCopyText();

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
        General Information
      </h3>
      <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-sm">
        <span className="text-slate-500">Request URL:</span>
        <span className="font-mono break-all text-slate-200 flex items-start gap-2">
          <span className="flex-1">{event.url}</span>
          <button
            onClick={() => void copy(event.url)}
            className="shrink-0 text-primary hover:text-primary/80 cursor-pointer"
            title="Copy URL"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </span>

        <span className="text-slate-500">Request Method:</span>
        <span className="font-bold text-slate-200">{event.method}</span>

        <span className="text-slate-500">Status Code:</span>
        <span className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${statusDot(event.responseStatus)}`}
          />
          <span className="font-mono">{statusLabel(event.responseStatus)}</span>
        </span>

        <span className="text-slate-500">Duration:</span>
        <span className="font-mono">{event.duration}ms</span>

        {event.error && (
          <>
            <span className="text-slate-500">Error:</span>
            <span className="text-red-400 font-mono">{event.error}</span>
          </>
        )}
      </div>

      {/* Request Body */}
      <div className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
          Request Payload
        </h3>
        <JsonViewer data={event.requestBody ?? null} />
      </div>

      {/* Response Body */}
      <div className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
          Response Body
        </h3>
        <JsonViewer data={event.responseBody ?? null} />
      </div>
    </section>
  );
}

/* ── Headers Tab ─────────────────────────────────────────── */
function HeadersTab({ event }: { event: NetworkEvent }) {
  return (
    <>
      <HeaderSection title="Request Headers" headers={event.requestHeaders} />
      <HeaderSection title="Response Headers" headers={event.responseHeaders} />
    </>
  );
}

function HeaderSection({
  title,
  headers,
}: {
  title: string;
  headers: Record<string, string>;
}) {
  const entries = Object.entries(headers);
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {title}
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">
          ({entries.length} items)
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No headers</p>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4 space-y-2 border border-slate-200 dark:border-slate-800">
          {entries.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[180px_1fr] gap-2 text-xs">
              <span className="text-primary font-medium">{k}:</span>
              <span className="font-mono text-slate-300 break-all">{v}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Payload Tab ─────────────────────────────────────────── */
function PayloadTab({ event }: { event: NetworkEvent }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Request Payload
        </h3>
      </div>
      <JsonViewer data={event.requestBody ?? null} />
    </section>
  );
}

/* ── Response Tab ────────────────────────────────────────── */
function ResponseTab({ event }: { event: NetworkEvent }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Response Body
        </h3>
      </div>
      <JsonViewer data={event.responseBody ?? null} />
    </section>
  );
}

/* ── Timing Tab ──────────────────────────────────────────── */
function TimingTab({ event }: { event: NetworkEvent }) {
  const started = new Date(event.timestamp).toLocaleTimeString();
  const isSlow = event.duration >= 3000;

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
        Timing
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Started
          </span>
          <span className="text-sm font-mono">{started}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Duration
          </span>
          <span
            className={`text-sm font-mono font-bold ${isSlow ? 'text-amber-400' : ''}`}
          >
            {event.duration}ms
          </span>
        </div>
        {/* Visual bar */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isSlow ? 'bg-amber-500' : 'bg-primary'}`}
              style={{
                width: `${Math.min(100, (event.duration / 5000) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0ms</span>
            <span>5000ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
