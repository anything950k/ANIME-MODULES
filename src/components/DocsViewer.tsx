import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, CheckSquare, AlertCircle, Sparkles } from 'lucide-react';

export const DocsViewer: React.FC = () => {
  const [docList, setDocList] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('MODULE_QUALITY_CHECKLIST.md');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/docs')
      .then((r) => r.json())
      .then((d) => {
        if (d.docs) {
          setDocList(d.docs);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDoc) return;
    setLoading(true);
    fetch(`/api/doc/${encodeURIComponent(selectedDoc)}`)
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content || 'No content found');
      })
      .catch((err) => setContent(`Error loading document: ${err.message}`))
      .finally(() => setLoading(false));
  }, [selectedDoc]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar: List of Docs */}
      <div className="md:col-span-1 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          <span>Documentation &amp; Audits</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 space-y-1 max-h-[70vh] overflow-y-auto">
          {docList.map((doc) => {
            const isSelected = selectedDoc === doc;
            const isChecklist = doc.includes('CHECKLIST');
            const isIncident = doc.includes('VIDHAWK') || doc.includes('RELIABILITY');

            return (
              <button
                key={doc}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isChecklist ? (
                    <CheckSquare className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  ) : isIncident ? (
                    <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  )}
                  <span className="truncate">{doc.replace('.md', '')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Content */}
      <div className="md:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-md flex flex-col">
        <div className="border-b border-zinc-800 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{selectedDoc}</h2>
              <p className="text-xs text-zinc-400">Repository documentation &amp; engineering guidelines</p>
            </div>
          </div>

          {selectedDoc === 'MODULE_QUALITY_CHECKLIST.md' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3 w-3" /> Official Contract
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-zinc-950 p-6 rounded-xl border border-zinc-800/80 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap select-text max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center text-zinc-500 py-12">
              Loading documentation...
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};
