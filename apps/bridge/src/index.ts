import { DEFAULT_BRIDGE_PORT } from '@network-tool/shared';
import { spawn } from 'child_process';
import { startServer, stopServer } from './server.js';

function parseArgs(): { port: number; maxEvents: number; open: boolean } {
  const args = process.argv.slice(2);
  const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  };
  let port = parsePositiveInt(
    process.env.NETWORK_TOOL_BRIDGE_PORT ?? process.env.PORT,
    DEFAULT_BRIDGE_PORT,
  );
  let maxEvents = parsePositiveInt(
    process.env.NETWORK_TOOL_MAX_EVENTS ?? process.env.MAX_EVENTS,
    1000,
  );
  let open =
    process.env.NETWORK_TOOL_OPEN_DASHBOARD === undefined
      ? true
      : process.env.NETWORK_TOOL_OPEN_DASHBOARD !== 'false';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      const p = parseInt(args[i + 1]!, 10);
      if (!isNaN(p) && p > 0 && p < 65536) port = p;
      i++;
    }
    if (args[i] === '--max-events' && args[i + 1]) {
      const m = parseInt(args[i + 1]!, 10);
      if (!isNaN(m) && m > 0) maxEvents = m;
      i++;
    }
    if (args[i] === '--open') {
      open = true;
    }
    if (args[i] === '--no-open') {
      open = false;
    }
  }
  return { port, maxEvents, open };
}

function openDashboard(url: string): void {
  const platform = process.platform;
  const command =
    platform === 'darwin'
      ? 'open'
      : platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args =
    platform === 'win32'
      ? ['/c', 'start', '', url]
      : [url];

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch {
    // Browser launch is best-effort only.
  }
}

const { port, maxEvents, open } = parseArgs();
const server = startServer(port, maxEvents);

if (open) {
  const bridgeUrl = encodeURIComponent(`http://localhost:${port}`);
  openDashboard(`http://localhost:${port}/?bridge=${bridgeUrl}`);
}

function shutdown() {
  console.log('\n[bridge] shutting down...');
  stopServer(server)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

  // Force-exit if graceful shutdown stalls
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
