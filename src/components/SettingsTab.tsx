import React, { useState } from 'react';
import {
  Settings,
  Server,
  Film,
  BookOpen,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ModuleItem, RepositoryData } from '../types';

interface SettingsTabProps {
  modules: ModuleItem[];
  repoData: RepositoryData | null;
  defaultAnimeModule: string;
  defaultMangaModule: string;
  onSetDefaultAnime: (id: string) => void;
  onSetDefaultManga: (id: string) => void;
  onOpenDiagnosticSandbox?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  modules,
  repoData,
  defaultAnimeModule,
  defaultMangaModule,
  onSetDefaultAnime,
  onSetDefaultManga,
  onOpenDiagnosticSandbox,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'Anime' | 'Manga'>('all');
  const [useProxy, setUseProxy] = useState(true);

  const animeModules = modules.filter((m) => m.presentation?.category === 'Anime');
  const mangaModules = modules.filter((m) => m.presentation?.category === 'Manga');

  const displayedModules = modules.filter((m) => {
    if (filterCategory === 'all') return true;
    return m.presentation?.category === filterCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-28 space-y-8">
      {/* Settings Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>App Preferences & Modules</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure default providers, manage installed streaming & reading modules
        </p>
      </div>

      {/* Default Provider Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Default Anime Engine */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Default Anime Engine</span>
          </div>
          <p className="text-xs text-zinc-400">
            Selected provider used automatically when clicking anime on the Home feed.
          </p>
          <select
            value={defaultAnimeModule}
            onChange={(e) => onSetDefaultAnime(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {animeModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.presentation?.purpose || m.id} (v{m.version})
              </option>
            ))}
          </select>
        </div>

        {/* Default Manga Provider */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Default Manga Provider</span>
          </div>
          <p className="text-xs text-zinc-400">
            Selected provider used automatically when opening manga from the Home feed.
          </p>
          <select
            value={defaultMangaModule}
            onChange={(e) => onSetDefaultManga(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {mangaModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.presentation?.purpose || m.id} (v{m.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Network & Stream Security Options */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Built-in Proxy Stream Relayer</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Bypasses hotlinking blocks, CORS limits, and ISP throttle on video CDNs and manga image hosts.
            </p>
          </div>
          <button
            onClick={() => setUseProxy(!useProxy)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              useProxy ? 'bg-indigo-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                useProxy ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* All Modules List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>All Installed Modules ({modules.length})</span>
            </h2>
            <p className="text-xs text-zinc-400">
              {animeModules.length} Anime Streaming Engines · {mangaModules.length} Manga Chapter Providers
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterCategory === 'all' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400'
              }`}
            >
              All ({modules.length})
            </button>
            <button
              onClick={() => setFilterCategory('Anime')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterCategory === 'Anime' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400'
              }`}
            >
              Anime ({animeModules.length})
            </button>
            <button
              onClick={() => setFilterCategory('Manga')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterCategory === 'Manga' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400'
              }`}
            >
              Manga ({mangaModules.length})
            </button>
          </div>
        </div>

        {/* Modules Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedModules.map((m) => {
            const isAnime = m.presentation?.category === 'Anime';
            const isDefault =
              m.id === defaultAnimeModule || m.id === defaultMangaModule;

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-100 truncate">
                      {m.presentation?.purpose || m.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white ${
                        isAnime ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}
                    >
                      {m.presentation?.category || 'Provider'}
                    </span>
                    {isDefault && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 font-mono truncate">
                    ID: {m.id} · v{m.version}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Diagnostic Link */}
      {onOpenDiagnosticSandbox && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-zinc-200">Developer Diagnostic Sandbox</h4>
            <p className="text-[11px] text-zinc-500">
              Direct low-level JSON action executor, test battery runner, and repository validator.
            </p>
          </div>
          <button
            onClick={onOpenDiagnosticSandbox}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Sandbox</span>
          </button>
        </div>
      )}
    </div>
  );
};
