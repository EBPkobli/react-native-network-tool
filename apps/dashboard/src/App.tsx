import { useState, useCallback } from 'react';
import { ToastProvider } from './components/Toast.js';
import { ConnectPage } from './components/ConnectPage.js';
import { BridgeProvider } from './context/BridgeProvider.js';
import { setBridgeUrl } from './api/client.js';
import { MainPage } from './components/MainPage.js';

export function App() {
  const [bridgeUrl, setBridge] = useState<string | null>(null);

  const handleConnect = useCallback((url: string) => {
    setBridgeUrl(url);
    setBridge(url);
  }, []);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem('network-tool:last-bridge-url');
    setBridge(null);
  }, []);

  return (
    <ToastProvider>
      {bridgeUrl === null ? (
        <ConnectPage onConnect={handleConnect} />
      ) : (
        <BridgeProvider bridgeUrl={bridgeUrl}>
          <MainPage onDisconnect={handleDisconnect} />
        </BridgeProvider>
      )}
    </ToastProvider>
  );
}
