import { useBridge } from '../context/BridgeContext';
import { useFilteredEvents } from '../hooks/useFilteredEvents';
import { clearEvents, exportSession } from '../api/client';
import type { DecoratedEvent } from '../types';

const METHOD_COLOR: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-green-500',
  PUT: 'text-amber-500',
  PATCH: 'text-red-500',
  DELETE: 'text-red-500',
};

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-500';
  if (code >= 300 && code < 400) return 'text-amber-500';
  if (code >= 400) return 'text-red-500';
  return 'text-slate-400';
}

function statusText(code: number): string {
  if (code === 0) return 'ERR';
  return String(code);
}

function extractPath(url: string): { path: string; host: string } {
  try {
    const u = new URL(url.includes('://') ? url : `http://${url}`);
    return { path: u.pathname + u.search, host: u.host };
  } catch {
    return { path: url, host: '' };
  }
}

interface RequestListProps {
  searchUrl: string;
  onSearchChange: (v: string) => void;
  errorsOnly: boolean;
  onErrorsToggle: () => void;
  onDisconnect: () => void;
}

export function RequestList({
  searchUrl,
  onSearchChange,
  errorsOnly,
  onErrorsToggle,
  onDisconnect,
}: RequestListProps) {
  const { state, dispatch } = useBridge();

  const filters = {
    ...state.filters,
    url: searchUrl,
    status: errorsOnly ? null : state.filters.status,
  };

  const events = useFilteredEvents(state.events, filters);
  const errorsOnlyFiltered = errorsOnly
    ? events.filter(
        (e) => !e.success || e.responseStatus >= 400 || e.responseStatus === 0,
      )
    : events;

  const handleClear = () => {
    void clearEvents().then(() => dispatch({ type: 'EVENTS_CLEARED' }));
  };

  const handleExport = () => {
    if (state.currentSession) exportSession(state.currentSession.id);
  };

  return (
    <aside className="w-1/3 min-w-[380px] max-w-md border-r border-slate-200 dark:border-slate-800 flex flex-col bg-[#f5f7f8] dark:bg-[#101722]/50">
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              pulse_alert
            </span>
            <h1 className="text-sm font-semibold tracking-tight uppercase opacity-80">
              Network Inspector
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
              title="Clear events"
            >
              <span className="material-symbols-outlined text-sm">block</span>
            </button>
            <button
              onClick={handleExport}
              disabled={!state.currentSession}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
              title="Export session"
            >
              <span className="material-symbols-outlined text-sm">
                download
              </span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchUrl}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by URL..."
            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-slate-500"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              if (errorsOnly) onErrorsToggle();
            }}
            className={`px-2 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors ${
              !errorsOnly
                ? 'bg-primary text-white'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={onErrorsToggle}
            className={`px-2 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors ${
              errorsOnly
                ? 'bg-red-500 text-white'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400'
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      {/* Request list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {errorsOnlyFiltered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <span className="material-symbols-outlined text-3xl opacity-40">
              wifi_tethering_off
            </span>
            <span className="text-xs">No requests captured</span>
          </div>
        )}

        {errorsOnlyFiltered.map((evt) => (
          <RequestRow
            key={evt.id}
            event={evt}
            selected={evt.id === state.selectedId}
            onClick={() => dispatch({ type: 'EVENT_SELECTED', id: evt.id })}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          <strong className="text-slate-300">{state.events.length}</strong>{' '}
          requests
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                state.connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : state.connectionStatus === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-red-500'
              }`}
            />
            <span className="capitalize">{state.connectionStatus}</span>
          </div>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Switch port"
          >
            <span className="material-symbols-outlined text-xs">swap_horiz</span>
            <span>Switch</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function RequestRow({
  event,
  selected,
  onClick,
}: {
  event: DecoratedEvent;
  selected: boolean;
  onClick: () => void;
}) {
  const { path, host } = extractPath(event.url);
  const methodColor = METHOD_COLOR[event.method.toUpperCase()] ?? 'text-slate-400';
  const stColor = statusColor(event.responseStatus);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors border-l-2 ${
        selected
          ? 'bg-primary/10 border-primary'
          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[10px] font-bold uppercase ${methodColor}`}
          >
            {event.method}
          </span>
          <span className="text-sm font-medium truncate">{path}</span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">{host}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-xs font-mono ${stColor}`}>
          {statusText(event.responseStatus)}
        </span>
        <p className="text-[10px] text-slate-500">{event.duration}ms</p>
      </div>
    </div>
  );
}
