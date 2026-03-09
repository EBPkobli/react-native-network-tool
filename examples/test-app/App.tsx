import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { NetworkInspector } from '@network-tool/sdk';

// Initialize the SDK — captures all fetch() calls and sends them to the bridge.
// Use __DEV__ guard so it's a no-op in production builds.
NetworkInspector.init({
  enabled: __DEV__,
  // Android emulator needs 10.0.2.2 to reach host machine localhost.
  // iOS simulator and web can use localhost directly.
  bridgeHost: Platform.OS === 'android' ? '10.0.2.2' : 'localhost',
  bridgePort: 8347,
});

// ─── Test API calls ──────────────────────────────────────────

const ENDPOINTS = [
  {
    label: '✅ GET Users',
    run: () => fetch('https://jsonplaceholder.typicode.com/users'),
  },
  {
    label: '✅ GET Posts',
    run: () => fetch('https://jsonplaceholder.typicode.com/posts?_limit=5'),
  },
  {
    label: '✅ GET Single User',
    run: () => fetch('https://jsonplaceholder.typicode.com/users/1'),
  },
  {
    label: '📝 POST Create',
    run: () =>
      fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer my-secret-token-12345',
        },
        body: JSON.stringify({
          title: 'Test Post',
          body: 'This is a test from the Network Inspector example app',
          userId: 1,
        }),
      }),
  },
  {
    label: '🔄 PUT Update',
    run: () =>
      fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'secret-api-key',
        },
        body: JSON.stringify({
          id: 1,
          title: 'Updated',
          body: 'Updated body',
          userId: 1,
        }),
      }),
  },
  {
    label: '🗑️ DELETE Post',
    run: () =>
      fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE',
      }),
  },
  {
    label: '❌ 404 Error',
    run: () => fetch('https://jsonplaceholder.typicode.com/nonexistent-endpoint'),
  },
  {
    label: '💥 Network Error',
    run: () => fetch('https://this-domain-does-not-exist-12345.com/api'),
  },
];

// ─── Component ───────────────────────────────────────────────

interface LogEntry {
  id: number;
  label: string;
  status: string;
  time: number;
}

let logId = 0;

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const runSingle = useCallback(
    async (endpoint: (typeof ENDPOINTS)[number]) => {
      const start = Date.now();
      try {
        const res = await endpoint.run();
        // Read body to ensure the SDK captures the response
        await res.text();
        setLogs((prev) => [
          {
            id: ++logId,
            label: endpoint.label,
            status: `${res.status} ${res.statusText}`,
            time: Date.now() - start,
          },
          ...prev,
        ]);
      } catch (err: unknown) {
        setLogs((prev) => [
          {
            id: ++logId,
            label: endpoint.label,
            status: `ERROR: ${err instanceof Error ? err.message : 'Unknown'}`,
            time: Date.now() - start,
          },
          ...prev,
        ]);
      }
    },
    [],
  );

  const runAll = useCallback(async () => {
    setRunning(true);
    for (const ep of ENDPOINTS) {
      await runSingle(ep);
      // Small delay between calls for readability in the dashboard
      await new Promise((r) => setTimeout(r, 300));
    }
    setRunning(false);
  }, [runSingle]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⬡</Text>
        <Text style={styles.headerTitle}>Network Inspector Test</Text>
        <Text style={styles.headerSub}>
          Tap buttons to make requests. Check the dashboard.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={runAll}
          disabled={running}
        >
          <Text style={styles.btnText}>
            {running ? 'Running...' : '🚀 Run All Requests'}
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.singleBtns}
          contentContainerStyle={styles.singleBtnsContent}
        >
          {ENDPOINTS.map((ep, i) => (
            <TouchableOpacity
              key={i}
              style={styles.btn}
              onPress={() => void runSingle(ep)}
            >
              <Text style={styles.btnTextSmall}>{ep.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Log output */}
      <View style={styles.logContainer}>
        <Text style={styles.logHeader}>
          Request Log ({logs.length})
        </Text>
        <ScrollView style={styles.logScroll}>
          {logs.length === 0 && (
            <Text style={styles.logEmpty}>
              No requests yet. Tap a button above.
            </Text>
          )}
          {logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logLabel}>{log.label}</Text>
              <Text
                style={[
                  styles.logStatus,
                  log.status.startsWith('2')
                    ? styles.logGreen
                    : log.status.startsWith('ERROR')
                      ? styles.logRed
                      : styles.logAmber,
                ]}
              >
                {log.status}
              </Text>
              <Text style={styles.logTime}>{log.time}ms</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Bridge: {Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:8347
        </Text>
        <Text style={styles.footerText}>SDK v0.1.0</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101722',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerIcon: {
    fontSize: 28,
    color: '#3c83f6',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748b',
  },
  actions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  btn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  btnPrimary: {
    backgroundColor: '#3c83f6',
    marginBottom: 12,
    marginRight: 0,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnTextSmall: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  singleBtns: {
    flexGrow: 0,
  },
  singleBtnsContent: {
    paddingRight: 16,
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  logHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  logScroll: {
    flex: 1,
  },
  logEmpty: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logLabel: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
  },
  logStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 8,
  },
  logGreen: { color: '#22c55e' },
  logAmber: { color: '#f59e0b' },
  logRed: { color: '#ef4444' },
  logTime: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    width: 50,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerText: {
    color: '#475569',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
