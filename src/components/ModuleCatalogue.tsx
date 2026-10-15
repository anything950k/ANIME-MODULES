import React, { useState } from 'react';
import { ModuleItem } from '../types';
import { 
  Search, 
  Play, 
  FileCode, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Layers,
  Film,
  BookOpen,
  Music,
  Info
} from 'lucide-react';

interface ModuleCatalogueProps {
  modules: ModuleItem[];
  selectedCategory: string;
  onSelectModuleForSandbox: (moduleId: string) => void;
  onViewCode: (moduleId: string) => void;
}

export const ModuleCatalogue: React.FC<ModuleCatalogueProps> = ({
  modules,
  selectedCategory,
  onSelectModuleForSandbox,
  onViewCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChangelogId, setExpandedChangelogId] = useState<string | null>(null);

  const filteredModules = modules.filter((m) => {
    // Category match
    if (selectedCategory !== 'all') {
      const cat = m.presentation.category || 'Other';
      if (cat !== selectedCategory) return false;
    }

    // Search query match
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      (m.identity && m.identity.toLowerCase().includes(q)) ||
      (m.presentation.purpose && m.presentation.purpose.toLowerCase().includes(q)) ||
      (m.presentation.language && m.presentation.language.toLowerCase().includes(q)) ||
      (m.presentation.category && m.presentation.category.toLowerCase().includes(q))
    );
  });

  const toggleChangelog = (id: string) => {
    setExpandedChangelogId(expandedChangelogId === id ? null : id);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-3.5 w-3.5 text-sky-400" />;
      case 'image':
      case 'text':
        return <BookOpen className="h-3.5 w-3.5 text-emerald-400" />;
      case 'music':
        return <Music className="h-3.5 w-3.5 text-fuchsia-400" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search modules by name, id, language, identity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>Showing <strong className="text-zinc-200">{filteredModules.length}</strong> of {modules.length} modules</span>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((m) => {
          const isChangelogOpen = expandedChangelogId === m.id;
          const downloadUrl = `/modules/${m.localFile.replace('modules/', '')}`;

          return (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/90 shadow-sm"
            >
              <div>
                {/* Header: Icon & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-zinc-800 border border-zinc-700/60 p-1 flex items-center justify-center">
                    {m.presentation.iconUrl ? (
                      <img
                        src={m.presentation.iconUrl}
                        alt={m.id}
                        className="h-full w-full object-contain rounded-lg"
                        onError={(e) => {
                          // Fallback if local icon failed
                          (e.currentTarget as HTMLImageElement).src =
                            m.presentation.rawIconUrl || '';
                        }}
                      />
                    ) : (
                      <Layers className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {m.presentation.recommended && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                          <Sparkles className="h-3 w-3" />
                          Recommended
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                        {getContentTypeIcon(m.contentType)}
                        <span className="capitalize">{m.contentType}</span>
                      </span>
                    </div>

                    <span className="text-xs font-mono text-indigo-400 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      v{m.version}
                    </span>
                  </div>
                </div>

                {/* Identity & Title */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base tracking-tight leading-snug">
                      {m.presentation.purpose || m.id}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]" title={m.id}>
                      {m.id}
                    </span>
                    {m.identity && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[140px]" title={m.identity}>
                          {m.identity}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Details Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {m.presentation.category && (
                    <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-300">
                      {m.presentation.category}
                    </span>
                  )}
                  {m.presentation.language && (
                    <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-300">
                      {m.presentation.language}
                    </span>
                  )}
                  <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-400">
                    Min App v{m.minAppVersion}
                  </span>
                  {m.sizeBytes > 0 && (
                    <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-400">
                      {(m.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>

                {/* Changelog Accordion */}
                {m.changelog && m.changelog.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-zinc-800/50">
                    <button
                      onClick={() => toggleChangelog(m.id)}
                      className="flex items-center justify-between w-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <span className="font-medium">Changelog ({m.changelog.length} notes)</span>
                      {isChangelogOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isChangelogOpen && (
                      <div className="mt-2 space-y-1.5 rounded-lg bg-zinc-950/70 p-2.5 text-[11px] text-zinc-300 max-h-40 overflow-y-auto border border-zinc-800/60">
                        {m.changelog.map((note, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 shrink-0">•</span>
                            <span className="leading-relaxed">{note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectModuleForSandbox(m.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Run Sandbox</span>
                </button>

                <button
                  onClick={() => onViewCode(m.id)}
                  title="View Scraper Source Code (index.js)"
                  className="rounded-xl border border-zinc-700 bg-zinc-800/70 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                >
                  <FileCode className="h-4 w-4" />
                </button>

                <a
                  href={downloadUrl}
                  download
                  title={`Download binary module package (${m.localFile})`}
                  className="rounded-xl border border-zinc-700 bg-zinc-800/70 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
