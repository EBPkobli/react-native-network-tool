#!/usr/bin/env node
/**
 * E2E integration test script — sends fake NetworkEvents to the bridge
 * to verify the full SDK → Bridge → Dashboard flow without an RN app.
 *
 * Usage:
 *   node scripts/e2e-test.mjs [--bridge http://localhost:8347] [--count 10]
 *
 * Prerequisites:
 *   - Bridge must be running: npx tsx apps/bridge/src/index.ts
 *   - Dashboard must be running: npm run dev --workspace=apps/dashboard
 */

// Parse CLI args ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let bridgeUrl = 'http://localhost:8347';
let count = 10;
let delayMs = 500;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bridge' && args[i + 1]) { bridgeUrl = args[++i]; }
  if (args[i] === '--count' && args[i + 1])  { count = parseInt(args[++i], 10); }
  if (args[i] === '--delay' && args[i + 1])  { delayMs = parseInt(args[++i], 10); }
}

// Event templates ────────────────────────────────────────────────────────────

const EVENTS = [
  {
    method: 'GET', url: 'https://api.example.com/users',
    status: 200, duration: 120, body: '{"users":[{"id":1,"name":"Alice"}]}',
    success: true, error: null,
    reqHeaders: { accept: 'application/json' },
    resHeaders: { 'content-type': 'application/json' },
  },
  {
    method: 'POST', url: 'https://api.example.com/login',
    status: 401, duration: 55, body: '{"error":"Unauthorized"}',
    success: false, error: null,
    reqHeaders: { authorization: 'Bearer secrettoken', 'content-type': 'application/json' },
    resHeaders: { 'content-type': 'application/json' },
    reqBody: '{"username":"alice","password":"hunter2"}',
  },
  {
    method: 'POST', url: 'https://api.example.com/items',
    status: 201, duration: 88, body: '{"id":42}',
    success: true, error: null,
    reqHeaders: { authorization: 'Bearer secrettoken', 'content-type': 'application/json' },
    resHeaders: { 'content-type': 'application/json' },
    reqBody: '{"name":"Widget"}',
  },
  {
    method: 'GET', url: 'https://api.example.com/products?page=2',
    status: 200, duration: 3800, body: '{"products":[]}', // slow — >3s
    success: true, error: null,
    reqHeaders: { accept: 'application/json' },
    resHeaders: { 'content-type': 'application/json' },
  },
  {
    method: 'DELETE', url: 'https://api.example.com/items/42',
    status: 204, duration: 60, body: null,
    success: true, error: null,
    reqHeaders: { authorization: 'Bearer secrettoken' },
    resHeaders: {},
  },
  {
    method: 'GET', url: 'https://api.example.com/users', // duplicate of first GET
    status: 200, duration: 95, body: '{"users":[]}',
    success: true, error: null,
    reqHeaders: {},
    resHeaders: { 'content-type': 'application/json' },
  },
  {
    method: 'GET', url: 'https://api.example.com/nonexistent',
    status: 404, duration: 30, body: '{"error":"Not found"}',
    success: false, error: null,
    reqHeaders: {},
    resHeaders: { 'content-type': 'application/json' },
  },
  {
    method: 'POST', url: 'https://api.example.com/upload',
    status: 0, duration: 1200, body: null,
    success: false, error: 'Network request failed',
    reqHeaders: { 'content-type': 'multipart/form-data' },
    resHeaders: {},
  },
];

// Helpers ────────────────────────────────────────────────────────────────────

let seq = 0;
function makeEvent(template, ts) {
  return {
    id: `e2e-${Date.now()}-${seq++}`,
    timestamp: ts,
    method: template.method,
    url: template.url,
    requestHeaders: template.reqHeaders ?? {},
    requestBody: template.reqBody ?? null,
    responseStatus: template.status,
    responseHeaders: template.resHeaders ?? {},
    responseBody: template.body,
    duration: template.duration,
    success: template.success,
    error: template.error,
  };
}

async function sendEvent(event) {
  const res = await fetch(`${bridgeUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return res.status;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Checks ─────────────────────────────────────────────────────────────────────

async function checkBridge() {
  try {
    const res = await fetch(`${bridgeUrl}/health`);
    const body = await res.json();
    return body;
  } catch {
    return null;
  }
}

// Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Network Inspector — E2E Integration Test`);
  console.log(`   Bridge: ${bridgeUrl}`);
  console.log(`   Events: ${count}  Delay: ${delayMs}ms\n`);

  // 1. Verify bridge is up
  const health = await checkBridge();
  if (!health) {
    console.error(`❌ Bridge unreachable at ${bridgeUrl}`);
    console.error(`   Start it with: npx tsx apps/bridge/src/index.ts`);
    process.exit(1);
  }
  console.log(`✅ Bridge healthy — session: ${health.session}`);

  // 2. Send events
  console.log(`\n📤 Sending ${count} events...\n`);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < count; i++) {
    const template = EVENTS[i % EVENTS.length];
    const event = makeEvent(template, Date.now());
    try {
      const status = await sendEvent(event);
      const icon = status === 201 ? '✓' : '✗';
      const slow = event.duration >= 3000 ? ' [SLOW]' : '';
      console.log(
        `  ${icon} [${i + 1}/${count}] ${event.method.padEnd(6)} ${event.url} → HTTP ${status}${slow}`,
      );
      if (status === 201) sent++;
      else failed++;
    } catch (err) {
      console.log(`  ✗ [${i + 1}/${count}] Failed to send: ${err.message}`);
      failed++;
    }
    if (i < count - 1) await sleep(delayMs);
  }

  // 3. Verify via GET
  console.log('\n📥 Verifying stored events...');
  try {
    const res = await fetch(`${bridgeUrl}/api/events`);
    const body = await res.json();
    const totalHeader = res.headers.get('x-total-count');
    console.log(`   Stored: ${body.total} events (X-Total-Count: ${totalHeader})`);
  } catch {
    console.log('   Could not verify stored events.');
  }

  // 4. Test filtering
  console.log('\n🔎 Testing filters...');
  for (const [param, label] of [
    ['method=GET', 'method=GET'],
    ['status=4xx', 'status=4xx'],
    ['url=login', 'url=login'],
  ]) {
    const res = await fetch(`${bridgeUrl}/api/events?${param}`);
    const body = await res.json();
    console.log(`   ?${label.padEnd(12)} → ${body.total} events`);
  }

  // 5. Large-body test — verify bridge accepts and stores bodies up to its 512 KB limit
  //    NOTE: actual body truncation (64 KB limit) lives in the SDK's event-builder, not the bridge.
  //    The SDK calls truncateBody() before posting. This test verifies the bridge side is healthy.
  console.log('\n📦 Testing large body storage (bridge 512 KB limit)...');
  const bigBody = 'x'.repeat(65_536); // 64 KB — matches SDK max; bridge accepts it fine
  const truncEvent = makeEvent(
    {
      method: 'POST', url: 'https://api.example.com/large-body-test',
      status: 200, duration: 50,
      success: true, error: null,
      reqHeaders: {},
      resHeaders: {},
    },
    Date.now(),
  );
  truncEvent.responseBody = bigBody;
  try {
    const status = await sendEvent(truncEvent);
    if (status === 201) {
      const res = await fetch(`${bridgeUrl}/api/events?url=large-body-test`);
      const body = await res.json();
      const events = body.data ?? body.events ?? [];
      const stored = events[events.length - 1]?.responseBody ?? null;
      if (stored !== null) {
        const pass = stored.length === 65_536;
        console.log(`   ${pass ? '✅' : '❌'} Stored body length: ${stored.length} (expected: 65536)`);
      } else {
        console.log('   ⚠️  Could not retrieve stored event — check GET /api/events response shape');
      }
    } else {
      console.log(`   ❌ Bridge rejected large-body event: HTTP ${status}`);
    }
  } catch (err) {
    console.log(`   ❌ Large-body test failed: ${err.message}`);
  }

  // 6. Summary
  console.log(`\n─────────────────────────────────`);
  console.log(`  Sent: ${sent}  Failed: ${failed}`);
  if (sent > 0) {
    console.log(`\n  ✅ Open the dashboard to see live events:`);
    console.log(`     npm run dev --workspace=apps/dashboard`);
    console.log(`     Then open http://localhost:5173\n`);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
