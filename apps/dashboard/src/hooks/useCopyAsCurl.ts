import { useState, useCallback } from 'react';
import type { NetworkEvent } from '@network-tool/shared';

function buildCurlCommand(evt: NetworkEvent): string {
  const parts: string[] = [`curl -X ${evt.method}`];
  for (const [k, v] of Object.entries(evt.requestHeaders)) {
    parts.push(`  -H '${k}: ${v.replace(/'/g, "'\\''")}'`);
  }
  if (evt.requestBody) {
    parts.push(`  --data-raw '${evt.requestBody.replace(/'/g, "'\\''")}'`);
  }
  parts.push(`  '${evt.url}'`);
  return parts.join(' \\\n');
}

export function useCopyAsCurl() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (evt: NetworkEvent) => {
    const cmd = buildCurlCommand(evt);
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }, []);

  return { copy, copied };
}
