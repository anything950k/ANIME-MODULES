import React, { useState } from 'react';
import { 
  Package, 
  Play, 
  Terminal, 
  FileCheck, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  ShieldCheck,
  Film
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalogue' | 'sandbox' | 'stream' | 'tests' | 'docs';
  setActiveTab: (tab: 'catalogue' | 'sandbox' | 'stream' | 'tests' | 'docs') => void;
  modulesCount: number;
  bundleVersion?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  modulesCount,
  bundleVersion = 146
}) => {
  const [copied, setCopied] = useState(false);
  const repoUrl = `${window.location.origin}/repository.json`;

  const copyRepoUrl = () => {
    navigator.clipboard.writeText(repoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">Synthetiq Anime &amp; Manga</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Anime &amp; Manga Only
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {modulesCount} Curated Anime &amp; Manga Engines • Bundle #{bundleVersion}
            </p>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800/80">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'catalogue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Catalogue</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Sandbox Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'stream'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Media Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Tests & QA</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Checklist & Docs</span>
          </button>
        </nav>

        {/* Right actions: Copy Repo URL */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyRepoUrl}
            title="Copy Repository URL for Synthetiq Player"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 hover:border-zinc-600"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied URL!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden lg:inline">Player URL: </span>
                <span className="text-zinc-400">/repository.json</span>
              </>
            )}
          </button>
          
          <a
            href="/repository.json"
            target="_blank"
            rel="noopener noreferrer"
            title="Open raw repository.json"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
