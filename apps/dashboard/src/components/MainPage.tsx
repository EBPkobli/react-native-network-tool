import { useState } from 'react';
import { RequestList } from './RequestList';
import { DetailPanel } from './DetailPanel';
import { useBridge } from '../context/BridgeContext';

interface MainPageProps {
  onDisconnect: () => void;
}

export function MainPage({ onDisconnect }: MainPageProps) {
  const { state } = useBridge();
  const [searchUrl, setSearchUrl] = useState('');
  const [errorsOnly, setErrorsOnly] = useState(false);
  const hasSelection = state.selectedId !== null;

  return (
    <div className="flex h-screen overflow-hidden">
      <RequestList
        searchUrl={searchUrl}
        onSearchChange={setSearchUrl}
        errorsOnly={errorsOnly}
        onErrorsToggle={() => setErrorsOnly((p) => !p)}
        onDisconnect={onDisconnect}
      />
      {hasSelection ? (
        <DetailPanel />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center bg-[#f5f7f8] dark:bg-[#101722] text-slate-500">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-3">
            troubleshoot
          </span>
          <p className="text-sm">Select a request to inspect</p>
        </main>
      )}
    </div>
  );
}
