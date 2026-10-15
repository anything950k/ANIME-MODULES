import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, Layers, Download } from 'lucide-react';

interface CodeModalProps {
  moduleId: string | null;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ moduleId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ sourceType: string; path: string; code: string } | null>(null);
  const [manifestData, setManifestData] = useState<any>(null);
  const [viewTab, setViewTab] = useState<'code' | 'manifest'>('code');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/module/${moduleId}/code`).then((r) => r.json()),
      fetch(`/api/module/${moduleId}`).then((r) => r.json()),
    ])
      .then(([codeRes, detailRes]) => {
        if (codeRes.error) {
          setError(codeRes.error);
        } else {
          setData(codeRes);
        }
        if (detailRes.manifest) {
          setManifestData(detailRes.manifest);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (!moduleId) return null;

  const currentContent = viewTab === 'code' ? data?.code : JSON.stringify(manifestData, null, 2);

  const copyContent = () => {
    if (currentContent) {
      navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{moduleId}</span>
                {data?.sourceType && (
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-normal text-zinc-400">
                    {data.sourceType === 'editable_source' ? 'Editable Source' : 'Package ZIP Entry'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">{data?.path || 'Inspecting module archive'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs">
              <button
                onClick={() => setViewTab('code')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewTab === 'code' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                index.js
              </button>
              <button
                onClick={() => setViewTab('manifest')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  viewTab === 'manifest' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                module.json
              </button>
            </div>

            <button
              onClick={copyContent}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative flex-1 overflow-auto bg-zinc-950 p-6 font-mono text-xs text-zinc-300">
          {loading ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mr-2" />
              Loading module source...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-rose-300">
              Failed to load module file: {error}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all leading-relaxed select-text">
              {currentContent || '// No content available'}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3 text-xs text-zinc-500">
          <div>
            Lines: {currentContent ? currentContent.split('\n').length : 0} • Size:{' '}
            {currentContent ? (new Blob([currentContent]).size / 1024).toFixed(1) : 0} KB
          </div>
          <div>Synthetiq Modules Engine v8.0 Contract</div>
        </div>
      </div>
    </div>
  );
};
