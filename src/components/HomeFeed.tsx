import React, { useState, useEffect } from 'react';
import {
  Film,
  BookOpen,
  Play,
  Book,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Flame,
  Clock,
  Compass
} from 'lucide-react';

export interface FeedMediaItem {
  id: string;
  title: string;
  type: 'anime' | 'manga';
  image: string;
  bannerImage?: string;
  rating?: string;
  year?: string;
  genres?: string[];
  description?: string;
  episodesCount?: number | string;
  chaptersCount?: number | string;
  subDub?: 'Sub' | 'Dub' | 'Sub & Dub';
  badge?: string;
}

interface HomeFeedProps {
  onSelectItem: (item: FeedMediaItem) => void;
}

// Curated Hero items for Anime
const ANIME_HERO_ITEMS: FeedMediaItem[] = [
  {
    id: 'One Piece',
    title: 'One Piece — Egghead Island Arc',
    type: 'anime',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    rating: '9.2',
    year: '2024',
    genres: ['Action', 'Adventure', 'Fantasy'],
    description: 'Luffy and the Straw Hat Pirates arrive on the futuristic Egghead Island, home to the genius scientist Dr. Vegapunk.',
    subDub: 'Sub & Dub',
    badge: 'Trending #1',
    episodesCount: '1120+'
  },
  {
    id: 'Solo Leveling',
    title: 'Solo Leveling — Season 1',
    type: 'anime',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    rating: '8.9',
    year: '2024',
    genres: ['Action', 'Supernatural'],
    description: 'When the world was threatened by vicious monsters, Sung Jinwoo awakened a mysterious leveling system that made him humanity\'s greatest weapon.',
    subDub: 'Sub & Dub',
    badge: 'Popular',
    episodesCount: '12'
  },
  {
    id: 'Jujutsu Kaisen',
    title: 'Jujutsu Kaisen — Shibuya Incident',
    type: 'anime',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    rating: '9.1',
    year: '2023',
    genres: ['Action', 'Dark Fantasy'],
    description: 'Special Grade sorcerer Satoru Gojo is targeted by curses during Halloween in Shibuya in a battle that changes the sorcery world forever.',
    subDub: 'Sub & Dub',
    badge: 'Must Watch',
    episodesCount: '47'
  }
];

// Curated Hero items for Manga
const MANGA_HERO_ITEMS: FeedMediaItem[] = [
  {
    id: 'One Piece',
    title: 'One Piece — Manga Series',
    type: 'manga',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&auto=format&fit=crop&q=80',
    rating: '9.8',
    year: 'Ongoing',
    genres: ['Shonen', 'Action', 'Pirates'],
    description: 'Follow Monkey D. Luffy and his pirate crew in their search for the ultimate treasure, the One Piece, to become the next King of the Pirates.',
    badge: 'Top Manga',
    chaptersCount: '1195+'
  },
  {
    id: 'Chainsaw Man',
    title: 'Chainsaw Man — Part 2 Academy Arc',
    type: 'manga',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    rating: '9.0',
    year: 'Weekly',
    genres: ['Horror', 'Supernatural'],
    description: 'Denji navigates high school life while a new Devil Hunter emerges seeking revenge against the Chainsaw Devil.',
    badge: 'New Chapter',
    chaptersCount: '190+'
  },
  {
    id: 'Berserk',
    title: 'Berserk — The Black Swordsman',
    type: 'manga',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    rating: '9.9',
    year: 'Classic',
    genres: ['Dark Fantasy', 'Masterpiece'],
    description: 'Kentaro Miura\'s legendary dark fantasy masterpiece following Guts, a lone mercenary marked by destiny.',
    badge: 'Masterpiece',
    chaptersCount: '376+'
  }
];

// Anime Row Data
const ANIME_TRENDING: FeedMediaItem[] = [
  { id: 'Attack on Titan', title: 'Attack on Titan', type: 'anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80', rating: '9.3', year: '2023', subDub: 'Sub & Dub', badge: 'Top 1' },
  { id: 'Demon Slayer', title: 'Demon Slayer: Kimetsu no Yaiba', type: 'anime', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80', rating: '8.8', year: '2024', subDub: 'Sub & Dub', badge: 'HD' },
  { id: 'Jujutsu Kaisen', title: 'Jujutsu Kaisen', type: 'anime', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80', rating: '9.0', year: '2023', subDub: 'Sub & Dub' },
  { id: 'Frieren', title: 'Frieren: Beyond Journey\'s End', type: 'anime', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80', rating: '9.4', year: '2024', subDub: 'Sub & Dub', badge: 'Popular' },
  { id: 'Bleach', title: 'Bleach: Thousand-Year Blood War', type: 'anime', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', rating: '9.1', year: '2024', subDub: 'Sub & Dub' },
  { id: 'Naruto', title: 'Naruto Shippuden', type: 'anime', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', rating: '8.7', year: 'Classic', subDub: 'Sub & Dub' },
];

const ANIME_NEW_EPISODES: FeedMediaItem[] = [
  { id: 'One Piece', title: 'One Piece', type: 'anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80', badge: 'EP 1120', rating: '9.2' },
  { id: 'Solo Leveling', title: 'Solo Leveling', type: 'anime', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80', badge: 'EP 12', rating: '8.9' },
  { id: 'Kaiju No. 8', title: 'Kaiju No. 8', type: 'anime', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', badge: 'EP 12', rating: '8.6' },
  { id: 'Mushoku Tensei', title: 'Mushoku Tensei Season 2', type: 'anime', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80', badge: 'EP 24', rating: '8.7' },
  { id: 'Chainsaw Man', title: 'Chainsaw Man', type: 'anime', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80', badge: 'EP 12', rating: '8.8' },
];

// Manga Row Data
const MANGA_TRENDING: FeedMediaItem[] = [
  { id: 'One Piece', title: 'One Piece', type: 'manga', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', rating: '9.8', chaptersCount: '1195+', badge: 'Weekly' },
  { id: 'Jujutsu Kaisen', title: 'Jujutsu Kaisen', type: 'manga', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80', rating: '9.1', chaptersCount: '271' },
  { id: 'Chainsaw Man', title: 'Chainsaw Man', type: 'manga', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80', rating: '9.0', chaptersCount: '190+' },
  { id: 'Solo Leveling', title: 'Solo Leveling (Webtoon)', type: 'manga', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80', rating: '9.4', chaptersCount: '200' },
  { id: 'Berserk', title: 'Berserk', type: 'manga', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80', rating: '9.9', chaptersCount: '376' },
  { id: 'Oshi no Ko', title: 'Oshi no Ko', type: 'manga', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80', rating: '8.9', chaptersCount: '166' },
];

const MANGA_NEW_CHAPTERS: FeedMediaItem[] = [
  { id: 'One Piece', title: 'One Piece', type: 'manga', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', badge: 'CH 1195', rating: '9.8' },
  { id: 'Boruto: Two Blue Vortex', title: 'Boruto: Two Blue Vortex', type: 'manga', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', badge: 'CH 16', rating: '8.5' },
  { id: 'Dragon Ball Super', title: 'Dragon Ball Super', type: 'manga', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80', badge: 'CH 103', rating: '8.4' },
  { id: 'Spy x Family', title: 'Spy x Family', type: 'manga', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80', badge: 'CH 105', rating: '9.0' },
];

export const HomeFeed: React.FC<HomeFeedProps> = ({ onSelectItem }) => {
  const [subTab, setSubTab] = useState<'anime' | 'manga'>('anime');
  const [heroIndex, setHeroIndex] = useState(0);

  const heroList = subTab === 'anime' ? ANIME_HERO_ITEMS : MANGA_HERO_ITEMS;

  // Auto-slide hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroList.length]);

  const currentHero = heroList[heroIndex] || heroList[0];

  const handleNextHero = () => setHeroIndex((prev) => (prev + 1) % heroList.length);
  const handlePrevHero = () => setHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length);

  return (
    <div className="pb-28">
      {/* Top Header & Sub-Tabs Switcher */}
      <div className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Synthetiq</span>
          </div>

          {/* Sub-Tabs: Anime vs Manga */}
          <div className="flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-800 shadow-inner">
            <button
              onClick={() => {
                setSubTab('anime');
                setHeroIndex(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'anime'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Anime</span>
            </button>
            <button
              onClick={() => {
                setSubTab('manga');
                setHeroIndex(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'manga'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manga</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-4 space-y-8">
        {/* Dynamic Hero Carousel */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-2xl group">
          <div className="relative h-72 sm:h-96 w-full">
            <img
              src={currentHero.bannerImage || currentHero.image}
              alt={currentHero.title}
              className="w-full h-full object-cover object-center filter brightness-60 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />

            {/* Slide Content */}
            <div className="absolute bottom-6 left-6 right-6 sm:max-w-xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {currentHero.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${
                    subTab === 'anime' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {currentHero.badge}
                  </span>
                )}
                {currentHero.rating && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {currentHero.rating}
                  </span>
                )}
                {currentHero.year && (
                  <span className="text-[11px] text-zinc-400 font-medium">· {currentHero.year}</span>
                )}
                {currentHero.subDub && (
                  <span className="text-[11px] text-indigo-300 font-medium">· {currentHero.subDub}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {currentHero.title}
              </h1>

              {currentHero.description && (
                <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                  {currentHero.description}
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onSelectItem(currentHero)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    subTab === 'anime'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  {subTab === 'anime' ? (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Watch Now</span>
                    </>
                  ) : (
                    <>
                      <Book className="w-4 h-4" />
                      <span>Read Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Carousel navigation controls */}
            <div className="absolute right-4 bottom-4 flex items-center gap-1.5">
              <button
                onClick={handlePrevHero}
                aria-label="Previous Slide"
                className="w-8 h-8 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextHero}
                aria-label="Next Slide"
                className="w-8 h-8 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {heroList.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === heroIndex
                    ? `w-6 ${subTab === 'anime' ? 'bg-indigo-500' : 'bg-emerald-500'}`
                    : 'w-1.5 bg-zinc-600/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Media Rows */}
        {subTab === 'anime' ? (
          <>
            {/* Row 1: Trending Anime */}
            <MediaRow
              title="Trending Now"
              icon={<Flame className="w-4 h-4 text-amber-400" />}
              items={ANIME_TRENDING}
              onSelectItem={onSelectItem}
            />

            {/* Row 2: New Episodes */}
            <MediaRow
              title="New Episodes Today"
              icon={<Clock className="w-4 h-4 text-sky-400" />}
              items={ANIME_NEW_EPISODES}
              onSelectItem={onSelectItem}
            />

            {/* Row 3: For You */}
            <MediaRow
              title="For You & Recommended"
              icon={<Compass className="w-4 h-4 text-indigo-400" />}
              items={ANIME_TRENDING.slice().reverse()}
              onSelectItem={onSelectItem}
            />
          </>
        ) : (
          <>
            {/* Row 1: Trending Manga */}
            <MediaRow
              title="Popular Manga"
              icon={<Flame className="w-4 h-4 text-emerald-400" />}
              items={MANGA_TRENDING}
              onSelectItem={onSelectItem}
            />

            {/* Row 2: New Chapters */}
            <MediaRow
              title="New Chapters Released"
              icon={<Clock className="w-4 h-4 text-emerald-300" />}
              items={MANGA_NEW_CHAPTERS}
              onSelectItem={onSelectItem}
            />

            {/* Row 3: Top Classics */}
            <MediaRow
              title="Staff Recommended"
              icon={<Compass className="w-4 h-4 text-teal-400" />}
              items={MANGA_TRENDING.slice().reverse()}
              onSelectItem={onSelectItem}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Reusable Left/Right Swipeable Media Row
interface MediaRowProps {
  title: string;
  icon: React.ReactNode;
  items: FeedMediaItem[];
  onSelectItem: (item: FeedMediaItem) => void;
}

const MediaRow: React.FC<MediaRowProps> = ({ title, icon, items, onSelectItem }) => {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={scrollLeft}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Container */}
      <div
        ref={rowRef}
        className="flex gap-3.5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectItem(item)}
            className="flex-shrink-0 w-36 sm:w-44 text-left group transition-transform duration-200 cursor-pointer focus:outline-none"
          >
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-zinc-600">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center filter brightness-90 group-hover:brightness-100 transition-all"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Top Badge */}
              {item.badge && (
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur shadow">
                  {item.badge}
                </span>
              )}

              {/* Rating */}
              {item.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-amber-400">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{item.rating}</span>
                </div>
              )}
            </div>

            <div className="mt-2 space-y-0.5">
              <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                {item.type === 'anime' ? (item.subDub || 'Sub & Dub') : (item.chaptersCount ? `${item.chaptersCount} Ch.` : 'Manga')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
