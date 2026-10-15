import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Book,
  Star,
  Film,
  BookOpen,
  Search,
  Loader2,
  AlertCircle,
  Radio,
  Server
} from 'lucide-react';
import { ModuleItem } from '../types';

interface MediaDetailsModalProps {
  item: {
    id: string;
    title: string;
    type: 'anime' | 'manga';
    image?: string;
    bannerImage?: string;
    rating?: string;
    year?: string;
    genres?: string[];
    description?: string;
  };
  modules: ModuleItem[];
  defaultAnimeModule?: string;
  defaultMangaModule?: string;
  onClose: () => void;
  onPlayEpisode: (videoData: any) => void;
  onReadChapter: (chapterData: any) => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  item,
  modules,
  defaultAnimeModule = 'synthetiq-anime-v1',
  defaultMangaModule = 'weebcentral-v2',
  onClose,
  onPlayEpisode,
  onReadChapter,
}) => {
  const isManga = item.type === 'manga';
  const availableModules = modules.filter((m) =>
    isManga ? m.presentation?.category === 'Manga' : m.presentation?.category === 'Anime'
  );

  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    return isManga ? defaultMangaModule : defaultAnimeModule;
  });

  const [subOrDub, setSubOrDub] = useState<'sub' | 'dub'>('sub');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState<string>(item.id);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // 1. First search series on selected module to get the provider-specific series ID
  useEffect(() => {
    let isCancelled = false;

    async function loadSeriesAndEpisodes() {
      setLoading(true);
      setError(null);
      setEpisodesList([]);

      try {
        // Step A: Search for the title on this module
        const searchRes = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: activeModuleId,
            action: 'searchResults',
            params: { query: item.title || item.id },
          }),
        }).then((r) => r.json());

        if (isCancelled) return;

        let targetId = item.id;
        if (searchRes.ok && Array.isArray(searchRes.result) && searchRes.result.length > 0) {
          const match = searchRes.result[0];
          targetId = match.id || match.href || match.url || item.id;
          setSeriesId(targetId);
        }

        // Step B: Extract Episodes or Chapters
        const extractAction = isManga ? 'extractChapters' : 'extractEpisodes';
        const epsRes = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: activeModuleId,
            action: extractAction,
            params: { id: targetId },
          }),
        }).then((r) => r.json());

        if (isCancelled) return;

        if (!epsRes.ok) {
          setError(epsRes.error || `Failed to fetch ${isManga ? 'chapters' : 'episodes'}`);
        } else {
          const list = Array.isArray(epsRes.result) ? epsRes.result : [];
          setEpisodesList(list);
          if (list.length === 0) {
            setError(`No ${isManga ? 'chapters' : 'episodes'} found on this provider.`);
          }
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || 'Error communicating with provider');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadSeriesAndEpisodes();

    return () => {
      isCancelled = true;
    };
  }, [item.id, item.title, activeModuleId, isManga]);

  // 2. Play episode or read chapter
  const handleItemClick = async (ep: any) => {
    const epRef = ep.id || ep.href || ep.url;
    setActionLoadingId(epRef);
    setError(null);

    try {
      if (isManga) {
        // Extract page images
        const res = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: activeModuleId,
            action: 'extractImages',
            params: { chapterId: epRef },
          }),
        }).then((r) => r.json());

        if (!res.ok) {
          setError(res.error || 'Failed to extract chapter pages');
        } else if (Array.isArray(res.result) && res.result.length > 0) {
          onReadChapter({
            type: 'manga',
            title: `${item.title} — ${ep.title || 'Chapter ' + (ep.number || '')}`,
            content: res.result,
          });
        } else {
          setError('No images returned for this chapter');
        }
      } else {
        // Extract stream URL
        const res = await fetch('/api/module/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: activeModuleId,
            action: 'extractStreamUrl',
            params: { episodeRef: epRef, subOrDub },
          }),
        }).then((r) => r.json());

        if (!res.ok) {
          setError(res.error || 'Failed to resolve stream for this episode');
        } else if (res.result) {
          onPlayEpisode({
            type: 'video',
            title: `${item.title} — ${ep.title || 'Episode ' + (ep.number || '')} (${subOrDub.toUpperCase()})`,
            content: res.result,
          });
        } else {
          setError('No video stream resolved for this episode');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEpisodes = episodesList.filter((ep) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const t = (ep.title || '').toLowerCase();
    const n = String(ep.number || '');
    return t.includes(q) || n.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Banner and Close */}
        <div className="relative h-48 sm:h-64 w-full flex-shrink-0 bg-zinc-900">
          <img
            src={item.bannerImage || item.image}
            alt={item.title}
            className="w-full h-full object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header inside Banner */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <div className="w-24 sm:w-32 aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-xl bg-zinc-900 hidden xs:block">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${
                  isManga ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}>
                  {isManga ? 'Manga' : 'Anime'}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                )}
                {item.year && <span className="text-xs text-zinc-400">· {item.year}</span>}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow truncate">
                {item.title}
              </h2>

              {item.description && (
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed hidden sm:block">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          {/* Module Provider Picker */}
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 hidden sm:inline">Provider:</span>
            <select
              value={activeModuleId}
              onChange={(e) => setActiveModuleId(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {availableModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.presentation?.purpose || m.id} (v{m.version})
                </option>
              ))}
            </select>
          </div>

          {/* Sub / Dub Toggle for Anime */}
          {!isManga && (
            <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setSubOrDub('sub')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  subOrDub === 'sub'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                SUB
              </button>
              <button
                onClick={() => setSubOrDub('dub')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  subOrDub === 'dub'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DUB
              </button>
            </div>
          )}

          {/* Episode / Chapter search filter */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filter ${isManga ? 'chapters' : 'episodes'}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        {/* Content Body: List of Episodes / Chapters */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">
                Fetching {isManga ? 'chapters' : 'episodes'} from provider...
              </p>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              No {isManga ? 'chapters' : 'episodes'} available to display.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredEpisodes.map((ep, idx) => {
                const epKey = ep.id || ep.href || ep.url || idx;
                const isLoadingThis = actionLoadingId === epKey;
                const displayTitle = ep.title || (isManga ? `Chapter ${ep.number || idx + 1}` : `Episode ${ep.number || idx + 1}`);

                return (
                  <button
                    key={idx}
                    disabled={actionLoadingId !== null}
                    onClick={() => handleItemClick(ep)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer group disabled:opacity-50"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400 truncate">
                        {displayTitle}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        {ep.number && <span>#{ep.number}</span>}
                        {ep.hasSub && <span>• Sub</span>}
                        {ep.hasDub && <span>• Dub</span>}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      ) : isManga ? (
                        <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Play className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
