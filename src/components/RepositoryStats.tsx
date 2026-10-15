import React from 'react';
import { RepositoryData } from '../types';
import { 
  Package, 
  Layers, 
  ShieldCheck, 
  FileCode, 
  Film, 
  BookOpen, 
  Music, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RepositoryStatsProps {
  repoData: RepositoryData | null;
  onSelectCategory: (cat: string) => void;
  selectedCategory: string;
  onOpenSandboxWithModule: (id: string) => void;
}

export const RepositoryStats: React.FC<RepositoryStatsProps> = ({
  repoData,
  onSelectCategory,
  selectedCategory,
  onOpenSandboxWithModule
}) => {
  if (!repoData) return null;

  return (
    <div className="space-y-6">
      {/* Hero Banner with repository info */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                Signed Bundle #{repoData.bundle?.version || 146}
              </span>
              <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                Schema v{repoData.schemaVersion}
              </span>
              <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                ID: {repoData.repositoryId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Synthetiq Anime &amp; Manga Modules
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Curated repository &amp; live runtime sandbox containing 25 verified Anime &amp; Manga provider engines. Resolves Japanese Sub/Dub streams, multi-server CDNs, and complete manga chapter pages.
            </p>
          </div>

          {/* Quick launch popular modules */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => onOpenSandboxWithModule('synthetiq-anime-v1')}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Test Bilibili</span>
            </button>
            <button
              onClick={() => onOpenSandboxWithModule('weebcentral-v2')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Test WeebCentral Manga</span>
            </button>
            <button
              onClick={() => onOpenSandboxWithModule('anikage-v1')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              <Film className="h-4 w-4 text-sky-400" />
              <span>Test Koto</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-zinc-800/80 pt-6">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Package className="h-4 w-4 text-indigo-400" />
              <span>Anime &amp; Manga Modules</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{repoData.modulesCount}</div>
            <div className="text-[11px] text-zinc-500">In repository.json</div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Film className="h-4 w-4 text-sky-400" />
              <span>Anime Streaming Engines</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-white">
              {repoData.categories?.['Anime'] || 19}
            </div>
            <div className="text-[11px] text-zinc-500">English Sub, Dub &amp; HLS</div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Manga &amp; Manhwa Readers</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-white">
              {repoData.categories?.['Manga'] || 6}
            </div>
            <div className="text-[11px] text-zinc-500">Chapters &amp; Full HD Pages</div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3.5">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Cryptographic State</span>
            </div>
            <div className="mt-1 text-base font-bold text-emerald-400 flex items-center gap-1">
              Signed &amp; Valid
            </div>
            <div className="text-[11px] text-zinc-500">SHA-256 Verified</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">Categories:</span>
        <button
          onClick={() => onSelectCategory('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          All ({repoData.modulesCount})
        </button>
        {Object.entries(repoData.categories || {}).map(([category, count]) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {category} ({count})
          </button>
        ))}
      </div>
    </div>
  );
};
