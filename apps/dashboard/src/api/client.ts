let _bridgeUrl = '';

export function setBridgeUrl(url: string): void {
  _bridgeUrl = url;
}

export function getBridgeUrl(): string {
  return _bridgeUrl;
}

export async function clearEvents(): Promise<void> {
  await fetch(`${_bridgeUrl}/api/events`, { method: 'DELETE' });
}

export function exportSession(sessionId: string): void {
  const a = document.createElement('a');
  a.href = `${_bridgeUrl}/api/sessions/${encodeURIComponent(sessionId)}/export`;
  a.download = `session-${sessionId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
