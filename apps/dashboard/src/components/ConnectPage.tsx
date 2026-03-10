import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './Toast';

const SCAN_PORTS = [8347, 8348, 8349, 8350, 8351, 8081, 8082, 8083, 3000, 3001];
const SCAN_TIMEOUT = 1500;
const LAST_BRIDGE_URL_KEY = 'network-tool:last-bridge-url';

interface Device {
  port: number;
  session: string;
  events: number;
}

interface ConnectPageProps {
  onConnect: (bridgeUrl: string) => void;
}

export function ConnectPage({ onConnect }: ConnectPageProps) {
  const [bridgeInput, setBridgeInput] = useState('8347');
  const [connecting, setConnecting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const { showToast } = useToast();

  const normalizeBridgeUrl = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const candidate = /^\d+$/.test(trimmed)
      ? `http://localhost:${trimmed}`
      : /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `http://${trimmed}`;

    try {
      return new URL(candidate).toString().replace(/\/+$/, '');
    } catch {
      return null;
    }
  }, []);

  const tryConnect = useCallback(
    async (target: string) => {
      const url = normalizeBridgeUrl(target);
      if (!url) {
        showToast('error', 'Invalid bridge URL or port');
        return false;
      }

      setConnecting(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${url}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          localStorage.setItem(LAST_BRIDGE_URL_KEY, url);
          showToast('success', `Connected to ${url}`);
          onConnect(url);
          return true;
        } else {
          showToast('error', `Bridge returned ${res.status}`);
        }
      } catch {
        showToast('error', `Could not reach ${url}`);
      } finally {
        setConnecting(false);
      }

      return false;
    },
    [normalizeBridgeUrl, onConnect, showToast],
  );

  const scanDevices = useCallback(async () => {
    setScanning(true);
    const found: Device[] = [];

    const checks = SCAN_PORTS.map(async (p) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SCAN_TIMEOUT);
        const res = await fetch(`http://localhost:${p}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = (await res.json()) as {
            status: string;
            events: number;
            session: string;
          };
          found.push({ port: p, session: data.session, events: data.events });
        }
      } catch {
        // port not reachable — skip
      }
    });

    await Promise.all(checks);
    found.sort((left, right) => left.port - right.port);
    setDevices(found);
    setScanning(false);
  }, []);

  // Use a ref so the one-time useEffect always sees the latest tryConnect
  const tryConnectRef = useRef(tryConnect);
  tryConnectRef.current = tryConnect;

  // Run ONCE on mount — auto-connect from query param or localStorage
  useEffect(() => {
    const queryBridge = new URLSearchParams(window.location.search).get('bridge');
    const lastBridge = localStorage.getItem(LAST_BRIDGE_URL_KEY);
    const autoTarget = queryBridge ?? lastBridge;

    if (autoTarget) {
      setBridgeInput(autoTarget);
      void (async () => {
        const connected = await tryConnectRef.current(autoTarget);
        if (!connected) {
          localStorage.removeItem(LAST_BRIDGE_URL_KEY);
          await scanDevices();
        }
      })();
      return;
    }

    void scanDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanDevices]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Connection Card */}
        <div className="relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-3xl">
                terminal
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Connect to Debugger
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Paste a bridge URL or enter a local port to start monitoring traffic
            </p>
          </div>

          {/* Input */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="port-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1"
              >
                Bridge URL or Port
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                    router
                  </span>
                </div>
                <input
                  id="port-input"
                  type="text"
                  value={bridgeInput}
                  onChange={(e) => setBridgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void tryConnect(bridgeInput);
                  }}
                  placeholder="e.g. 8347 or http://192.168.1.42:8347"
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-14 pl-12 pr-4 text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={() => void tryConnect(bridgeInput)}
              disabled={connecting}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{connecting ? 'Connecting...' : 'Connect'}</span>
              <span className="material-symbols-outlined text-xl">sensors</span>
            </button>
          </div>

          {/* Available Devices */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Available Devices
              </h2>
              <button
                onClick={() => void scanDevices()}
                disabled={scanning}
                className={`p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group text-slate-400 hover:text-primary cursor-pointer ${scanning ? 'animate-spin' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>
              </button>
            </div>

            <div className="grid gap-3">
              {devices.length === 0 && !scanning && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No devices found on common ports
                </p>
              )}
              {scanning && devices.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  Scanning ports...
                </p>
              )}
              {devices.map((dev) => (
                <button
                  key={dev.port}
                    onClick={() => void tryConnect(String(dev.port))}
                  className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">
                        smartphone
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Bridge ({dev.events} events)
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tight">
                        Port: {dev.port}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-lg">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Service Ready
              </div>
              <div>v0.1.0</div>
            </div>
          </div>
        </div>

        {/* Decorative hints */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="material-symbols-outlined text-sm">security</span>
                <span>Local or LAN</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>Auto-reconnect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
