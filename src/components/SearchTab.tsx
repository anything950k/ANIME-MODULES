import React, { useState, useEffect } from 'react';
import {
  Search,
  Server,
  Loader2,
  Film,
  BookOpen,
  Star,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';
import { ModuleItem } from '../types';
import { FeedMediaItem } from './HomeFeed';

interface SearchTabProps {
  modules: ModuleItem[];
  onSelectItem: (item: FeedMediaItem) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ modules, onSelectItem }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Anime' | 'Manga'>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('synthetiq-anime-v1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filteredModules = modules.filter((m) => {
    if (categoryFilter === 'all') return true;
    return m.presentation?.category === categoryFilter;
  });

  // When category changes, auto-select first matching module
  useEffect(() => {
    if (filteredModules.length > 0 && !filteredModules.some((m) => m.id === selectedModuleId)) {
      setSelectedModuleId(filteredModules[0].id);
    }
  }, [categoryFilter, filteredModules, selectedModuleId]);

  const handleSearch = async (targetQuery = query) => {
    if (!targetQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/module/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          action: 'searchResults',
          params: { query: targetQuery.trim(), page: 1 },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to search module');
      } else if (Array.isArray(data.result)) {
        setResults(data.result);
        if (data.result.length === 0) {
          setError(`No results found for "${targetQuery}" on this provider.`);
        }
      } else {
        setResults([]);
        setError('No valid results array returned.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing search');
    } finally {
      setLoading(false);
    }
  };

  // Re-search only when user already typed a query and changed module
  useEffect(() => {
    if (query.trim()) {
      handleSearch(query);
    }
  }, [selectedModuleId]);

  const quickPicks = ['One Piece', 'Naruto', 'Jujutsu Kaisen', 'Attack on Titan', 'Solo Leveling', 'Berserk'];

  const selectedModuleMeta = modules.find((m) => m.id === selectedModuleId);
  const isMangaModule =
    selectedModuleMeta?.contentType === 'image' ||
    selectedModuleMeta?.presentation?.category === 'Manga';

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Search & Explore
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search across any active Anime streaming engine or Manga provider
          </p>
        </div>

        {/* Search Bar & Module Select */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anime title, manga, character..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Module Selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Server className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm appearance-none"
              >
                {filteredModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.presentation?.purpose || m.id} ({m.presentation?.category || 'Anime'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Picks */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Category Toggle */}
          <div className="flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('Anime')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                categoryFilter === 'Anime'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Anime</span>
            </button>
            <button
              onClick={() => setCategoryFilter('Manga')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                categoryFilter === 'Manga'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Manga</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 font-medium">Suggestions:</span>
            {quickPicks.map((pick) => (
              <button
                key={pick}
                onClick={() => {
                  setQuery(pick);
                  handleSearch(pick);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                {pick}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Querying provider database...</p>
          </div>
        ) : !query.trim() && results.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">Explore Anime & Manga</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Type any anime or manga title in the search bar above, or click one of the suggestion tags to begin.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No results found for "{query}"</p>
            <p className="text-xs text-zinc-500">
              Try searching with another query or select another module provider above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {results.map((item, idx) => {
              const coverImg = item.image || item.poster || item.cover;
              const displayTitle = item.title || item.name || 'Untitled';
              const mediaType = isMangaModule ? 'manga' : 'anime';

              return (
                <button
                  key={idx}
                  onClick={() =>
                    onSelectItem({
                      id: item.id || item.href || item.url || displayTitle,
                      title: displayTitle,
                      type: mediaType,
                      image: coverImg || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
                      rating: item.rating,
                      year: item.year,
                      genres: Array.isArray(item.genres) ? item.genres : [],
                      description: item.description || item.synopsis,
                    })
                  }
                  className="text-left group flex flex-col cursor-pointer focus:outline-none transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-md group-hover:border-indigo-500/60 transition-all">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={displayTitle}
                        className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
                        No Poster
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Badge */}
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow text-white ${
                      isMangaModule ? 'bg-emerald-600' : 'bg-indigo-600'
                    }`}>
                      {isMangaModule ? 'Manga' : 'Anime'}
                    </span>

                    {item.rating && (
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {displayTitle}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {item.year || (isMangaModule ? 'Manga Series' : 'Anime Series')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
