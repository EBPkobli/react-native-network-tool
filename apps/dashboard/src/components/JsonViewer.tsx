interface JsonViewerProps {
  data: string | null | undefined;
  maxHeight?: string;
}

export function JsonViewer({ data, maxHeight = '400px' }: JsonViewerProps) {
  if (!data) {
    return (
      <div className="text-xs text-slate-500 italic py-3 px-4">No body</div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
    } catch {
      // clipboard unavailable
    }
  };

  let formatted: string;
  let highlighted: string;

  try {
    const parsed = JSON.parse(data);
    formatted = JSON.stringify(parsed, null, 2);
    highlighted = syntaxHighlight(formatted);
  } catch {
    formatted = data;
    highlighted = escapeHtml(data);
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 text-[10px] text-primary hover:underline uppercase font-bold cursor-pointer"
      >
        Copy
      </button>
      <div
        className="bg-slate-900 rounded-xl p-5 border border-slate-800 font-mono text-xs overflow-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        <pre
          className="leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function syntaxHighlight(json: string): string {
  return escapeHtml(json).replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (match.startsWith('"')) {
        cls = match.endsWith(':') ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (match === 'null') {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}
