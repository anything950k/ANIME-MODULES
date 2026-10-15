/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModuleItem, RepositoryData } from './types';
import { BottomNavBar, MainTabType } from './components/BottomNavBar';
import { HomeFeed, FeedMediaItem } from './components/HomeFeed';
import { SearchTab } from './components/SearchTab';
import { SettingsTab } from './components/SettingsTab';
import { MediaDetailsModal } from './components/MediaDetailsModal';
import { StreamInspector } from './components/StreamInspector';
import { SandboxRunner } from './components/SandboxRunner';
import { TestRunner } from './components/TestRunner';
import { Loader2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [mainTab, setMainTab] = useState<MainTabType>('home');
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Defaults
  const [defaultAnimeModule, setDefaultAnimeModule] = useState<string>('synthetiq-anime-v1');
  const [defaultMangaModule, setDefaultMangaModule] = useState<string>('weebcentral-v2');

  // Modals & Active Viewers
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<FeedMediaItem | null>(null);
  const [activeMediaData, setActiveMediaData] = useState<{
    type: 'video' | 'manga';
    title: string;
    content: any;
  } | null>(null);

  // Developer Sandbox modal
  const [showDeveloperSandbox, setShowDeveloperSandbox] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/repository').then((r) => r.json()),
      fetch('/api/modules').then((r) => r.json()),
    ])
      .then(([repo, modData]) => {
        if (repo.error) throw new Error(repo.error);
        if (modData.error) throw new Error(modData.error);
        setRepoData(repo);
        setModules(modData.modules || []);
      })
      .catch((err) => {
        console.error('Error fetching repo data:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetails = (item: FeedMediaItem) => {
    setSelectedDetailsItem(item);
  };

  const handlePlayEpisode = (videoData: any) => {
    setSelectedDetailsItem(null);
    setActiveMediaData(videoData);
  };

  const handleReadChapter = (chapterData: any) => {
    setSelectedDetailsItem(null);
    setActiveMediaData(chapterData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Global Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-xs text-red-400 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mt-2" />
            <p className="text-xs font-semibold tracking-wide text-zinc-300">
              Loading Synthetiq Anime & Manga...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Home Tab */}
            {mainTab === 'home' && <HomeFeed onSelectItem={handleOpenDetails} />}

            {/* 2. Search Tab */}
            {mainTab === 'search' && (
              <SearchTab modules={modules} onSelectItem={handleOpenDetails} />
            )}

            {/* 3. Settings Tab */}
            {mainTab === 'settings' && (
              <SettingsTab
                modules={modules}
                repoData={repoData}
                defaultAnimeModule={defaultAnimeModule}
                defaultMangaModule={defaultMangaModule}
                onSetDefaultAnime={setDefaultAnimeModule}
                onSetDefaultManga={setDefaultMangaModule}
                onOpenDiagnosticSandbox={() => setShowDeveloperSandbox(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Media Details Modal */}
      {selectedDetailsItem && (
        <MediaDetailsModal
          item={selectedDetailsItem}
          modules={modules}
          defaultAnimeModule={defaultAnimeModule}
          defaultMangaModule={defaultMangaModule}
          onClose={() => setSelectedDetailsItem(null)}
          onPlayEpisode={handlePlayEpisode}
          onReadChapter={handleReadChapter}
        />
      )}

      {/* Full-Screen Stream Inspector / Manga Reader Modal */}
      {activeMediaData && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-y-auto animate-in fade-in duration-200 p-2 sm:p-4">
          <div className="max-w-5xl mx-auto w-full my-auto">
            <StreamInspector
              mediaData={activeMediaData}
              onClose={() => setActiveMediaData(null)}
            />
          </div>
        </div>
      )}

      {/* Developer Diagnostic Sandbox Modal */}
      {showDeveloperSandbox && (
        <div className="fixed inset-0 z-50 bg-zinc-950 p-4 overflow-y-auto animate-in fade-in">
          <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Developer Diagnostic Sandbox</span>
              </h2>
              <button
                onClick={() => setShowDeveloperSandbox(false)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
              >
                Close Sandbox
              </button>
            </div>
            <SandboxRunner
              modules={modules}
              initialModuleId={defaultAnimeModule}
              onSendToInspector={(data) => {
                setShowDeveloperSandbox(false);
                setActiveMediaData(data);
              }}
            />
            <TestRunner />
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab={mainTab} onChangeTab={setMainTab} />
    </div>
  );
}
