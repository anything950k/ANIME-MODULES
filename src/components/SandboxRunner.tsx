import React, { useState, useEffect } from 'react';
import { ModuleItem, RunModuleResponse } from '../types';
import { 
  Play, 
  RotateCw, 
  Search, 
  Home, 
  Film, 
  Tv, 
  BookOpen, 
  Clock, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  Info,
  Layers,
  SlidersHorizontal,
  Zap
} from 'lucide-react';

interface SandboxRunnerProps {
  modules: ModuleItem[];
  initialModuleId: string | null;
  onSendToInspector: (data: { type: 'video' | 'manga'; title: string; content: any }) => void;
}

export const SandboxRunner: React.FC<SandboxRunnerProps> = ({
  modules,
  initialModuleId,
  onSendToInspector,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    initialModuleId || 'synthetiq-anime-v1'
  );
  
  // Search state
  const [query, setQuery] = useState('Naruto');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Selected series / episodes state
  const [selectedSeries, setSelectedSeries] = useState<{ id: string; title: string; image?: string } | null>(null);
  const [fetchingEpisodes, setFetchingEpisodes] = useState(false);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [episodeSearchFilter, setEpisodeSearchFilter] = useState('');
  const [subOrDub, setSubOrDub] = useState<'sub' | 'dub'>('sub');

  // Loading episode stream
  const [streamingEpisodeId, setStreamingEpisodeId] = useState<string | null>(null);

  // Manual Sandbox mode
  const [mode, setMode] = useState<'easy' | 'advanced'>('easy');
  const [action, setAction] = useState<string>('searchResults');
  const [manualItemId, setManualItemId] = useState('');
  const [advancedResponse, setAdvancedResponse] = useState<RunModuleResponse | null>(null);
  const [advancedRunning, setAdvancedRunning] = useState(false);

  // Error and feedback
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialModuleId) {
      setSelectedModuleId(initialModuleId);
    }
  }, [initialModuleId]);

  const currentModule = modules.find((m) => m.id === selectedModuleId);
  const isMangaModule =
    currentModule?.contentType === 'image' ||
    currentModule?.contentType === 'text' ||
    currentModule?.presentation?.category === 'Manga';

  const getPresets = () => {
    if (isMangaModule) {
      return ['One Piece', 'Chainsaw Man', 'Solo Leveling', 'Jujutsu Kaisen', 'Berserk'];
    }
    return ['Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer', 'Bleach', 'Jujutsu Kaisen'];
  };

  // 1. Search Function
  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm || query;
    if (!q.trim()) return;

    setSearching(true);
    setError(null);
    setSelectedSeries(null);
    setEpisodesList([]);

    try {
      const res = await fetch('/api/module/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          action: 'searchResults',
          params: { query: q, page: 1 },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Search failed');
      } else {
        const results = Array.isArray(data.result) ? data.result : [];
        setSearchResults(results);
        if (results.length === 0) {
          setError(`No results found for "${q}". Try another title or switch module.`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Search execution failed');
    } finally {
      setSearching(false);
    }
  };

  // 2. Fetch Episodes / Chapters automatically when user clicks series
  const handleSelectSeries = async (item: any) => {
    const seriesId = item.id || item.href || item.url;
    const seriesTitle = item.title || item.name || 'Selected Series';
    const seriesImage = item.image || item.poster || item.cover;

    setSelectedSeries({ id: seriesId, title: seriesTitle, image: seriesImage });
    setFetchingEpisodes(true);
    setError(null);
    setEpisodesList([]);

    const fetchAction = isMangaModule ? 'extractChapters' : 'extractEpisodes';

    try {
      const res = await fetch('/api/module/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          action: fetchAction,
          params: { id: seriesId },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch episodes');
      } else {
        const list = Array.isArray(data.result) ? data.result : [];
        setEpisodesList(list);
        if (list.length === 0) {
          setError(`No ${isMangaModule ? 'chapters' : 'episodes'} returned for this title.`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract episodes');
    } finally {
      setFetchingEpisodes(false);
    }
  };

  // 3. 1-Click Stream / Read Episode
  const handleStreamEpisode = async (ep: any) => {
    const epRef = ep.id || ep.href || ep.url;
    setStreamingEpisodeId(epRef);
    setError(null);

    try {
      if (isMangaModule) {
        // Fetch pages
        const res = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: selectedModuleId,
            action: 'extractImages',
            params: { chapterId: epRef },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load chapter images');
        } else if (Array.isArray(data.result) && data.result.length > 0) {
          onSendToInspector({
            type: 'manga',
            title: `${selectedSeries?.title || 'Manga'} — ${ep.title || 'Chapter ' + (ep.number || '')}`,
            content: data.result,
          });
        } else {
          setError('No images found in this chapter');
        }
      } else {
        // Fetch stream URL
        const res = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: selectedModuleId,
            action: 'extractStreamUrl',
            params: { episodeRef: epRef, subOrDub },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to resolve stream for this episode');
        } else if (data.result?.url) {
          onSendToInspector({
            type: 'video',
            title: `${selectedSeries?.title || 'Anime'} — ${ep.title || 'Episode ' + (ep.number || '')} (${subOrDub.toUpperCase()})`,
            content: data.result,
          });
        } else {
          setError('No stream URL resolved by the provider for this episode.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Stream extraction failed');
    } finally {
      setStreamingEpisodeId(null);
    }
  };

  // Filter episodes
  const filteredEpisodes = episodesList.filter((ep, idx) => {
    if (!episodeSearchFilter.trim()) return true;
    const filter = episodeSearchFilter.toLowerCase();
    const num = ep.number != null ? String(ep.number) : String(idx + 1);
    const title = (ep.title || '').toLowerCase();
    return num.includes(filter) || title.includes(filter);
  });

  return (
    <div className="space-y-6">
      {/* Top Controller Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600/10 p-2.5 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Anime &amp; Manga Stream Engine</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Direct Stream Flow
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                1-Click Search ➔ Browse All Episodes ➔ Live Video Player Streaming
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Module Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-400">Source:</label>
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedSeries(null);
                  setEpisodesList([]);
                  setSearchResults([]);
                }}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                <optgroup label="Anime Providers">
                  {modules
                    .filter((m) => m.presentation?.category === 'Anime')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.presentation.purpose || m.id} (v{m.version})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Manga Providers">
                  {modules
                    .filter((m) => m.presentation?.category === 'Manga')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.presentation.purpose || m.id} (v{m.version})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isMangaModule ? 'Search Manga (e.g. One Piece, Chainsaw Man)...' : 'Search Anime (e.g. Naruto, One Piece, Attack on Titan)...'}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className={`flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer ${
                searching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-500'
              }`}
            >
              {searching ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search {isMangaModule ? 'Manga' : 'Anime'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-500 text-[11px]">Popular Presets:</span>
            {getPresets().map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQuery(preset);
                  handleSearch(preset);
                }}
                className="rounded-lg bg-zinc-800/90 border border-zinc-700/60 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-5 text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>Notice</span>
          </div>
          <p className="text-xs font-mono">{error}</p>
        </div>
      )}

      {/* Step 1: Search Results Cards */}
      {searchResults.length > 0 && !selectedSeries && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-indigo-400" />
              <span>Search Results ({searchResults.length} Titles Found)</span>
            </h3>
            <span className="text-xs text-zinc-400">Click a title to load all episodes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((item, idx) => {
              const title = item.title || item.name || `Title #${idx + 1}`;
              const img = item.image || item.poster || item.cover;

              return (
                <div
                  key={idx}
                  className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 hover:border-indigo-500/60 hover:bg-zinc-950 transition-all shadow"
                >
                  <div>
                    {img ? (
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 mb-2.5">
                        <img
                          src={img}
                          alt={title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[2/3] w-full rounded-lg bg-zinc-900 mb-2.5 flex items-center justify-center text-zinc-600">
                        <Film className="h-8 w-8" />
                      </div>
                    )}

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {title}
                    </h4>

                    {item.year && (
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                        Year: {item.year}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectSeries(item)}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <Tv className="h-3.5 w-3.5" />
                    <span>{isMangaModule ? 'Read Chapters' : 'View Episodes'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Selected Series Episodes Browser */}
      {selectedSeries && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 space-y-6">
          {/* Series Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-4">
              {selectedSeries.image && (
                <img
                  src={selectedSeries.image}
                  alt={selectedSeries.title}
                  className="h-16 w-12 rounded-lg object-cover border border-zinc-700 shrink-0"
                />
              )}
              <div>
                <button
                  onClick={() => {
                    setSelectedSeries(null);
                    setEpisodesList([]);
                  }}
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                >
                  ← Back to search results
                </button>
                <h3 className="text-lg font-bold text-white">{selectedSeries.title}</h3>
                <p className="text-xs text-zinc-400">
                  {fetchingEpisodes ? (
                    'Fetching episode list from provider...'
                  ) : (
                    `${episodesList.length} ${isMangaModule ? 'Chapters' : 'Episodes'} Loaded`
                  )}
                </p>
              </div>
            </div>

            {/* Audio Language Switcher (Sub vs Dub) */}
            {!isMangaModule && (
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                <span className="text-[11px] font-medium text-zinc-400 px-2">Audio:</span>
                <button
                  onClick={() => setSubOrDub('sub')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    subOrDub === 'sub'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sub (Japanese)
                </button>
                <button
                  onClick={() => setSubOrDub('dub')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    subOrDub === 'dub'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Dub (English)
                </button>
              </div>
            )}
          </div>

          {/* Episode Search & Controls */}
          {fetchingEpisodes ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 space-y-3">
              <RotateCw className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Extracting all episodes for {selectedSeries.title}...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    value={episodeSearchFilter}
                    onChange={(e) => setEpisodeSearchFilter(e.target.value)}
                    placeholder={`Filter by ${isMangaModule ? 'chapter' : 'episode'} number (e.g. 1)...`}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2 pl-3 pr-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-zinc-500">
                  Showing {filteredEpisodes.length} of {episodesList.length}
                </div>
              </div>

              {/* Episode Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto p-1">
                {filteredEpisodes.map((ep, idx) => {
                  const epNum = ep.number != null ? ep.number : idx + 1;
                  const epTitle = ep.title || `${isMangaModule ? 'Chapter' : 'Episode'} ${epNum}`;
                  const epId = ep.id || ep.href || ep.url;
                  const isLoading = streamingEpisodeId === epId;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleStreamEpisode(ep)}
                      disabled={isLoading}
                      className={`flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-left transition-all hover:border-indigo-500 hover:bg-zinc-900/90 cursor-pointer ${
                        isLoading ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">
                            {isMangaModule ? `Ch. ${epNum}` : `Ep. ${epNum}`}
                          </span>
                          {!isMangaModule && (
                            <span className="rounded bg-indigo-950/80 px-1.5 py-0.5 text-[9px] font-mono text-indigo-400">
                              {subOrDub.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 leading-tight">
                          {epTitle}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/90 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors">
                        {isLoading ? (
                          <>
                            <RotateCw className="h-3 w-3 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-white" />
                            <span>{isMangaModule ? 'Read' : 'Stream'}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
