// Utility to manage user custom nicknames/aliases for modules

const STORAGE_KEY = 'synthetiq_module_aliases';

// Preset friendly names out-of-the-box so modules are super easy to recognize
export const DEFAULT_FRIENDLY_NAMES: Record<string, string> = {
  'synthetiq-anime-v1': '👑 Best All-Round Anime (Sub & Dub HD)',
  'synthetiq-anime-direct': '⚡ Ultra-Fast Anime Direct (Zero Buffer)',
  'synthetiq-one-v1': '🚀 Instant Dub Anime (Fastest)',
  'anikage-v1': '💎 AniKage (Softsubs & Crisp 1080p)',
  'kickassanime-v3': '🌐 KickAss Anime (3-5 Multi-Servers)',
  'miruro-v3': '✨ Miruro Anime (Modern & Clean)',
  'anikoto-v4': '📚 AniKoto (Full Classic & Ongoing Library)',
  'animeheaven-v2-1': '🏛️ AnimeHeaven (Retro & 90s Classics)',
  'animeav1-v1': '📱 Anime AV1 (Data Saver 1080p)',
  'anipm-v1': '🎯 AniPM Streamer',
  'justanime-v1': '🎬 JustAnime (Direct Hardsubs)',
  'an1me-v1': '📺 An1me Video Player',
  'mugiwara-v1': '👒 Mugiwara Anime Engine',
  'anime-sama-v1': '🇫🇷 Anime-Sama (French Sub/Dub)',
  'aniworld-v1': '🇩🇪 AniWorld (German Sub/Dub)',
  'animeunity-v1': '🇮🇹 AnimeUnity (Italian Sub/Dub)',
  'anime4up-site-v1': '🇸🇦 Anime4up (Arabic Sub/Dub)',

  // Manga
  'weebcentral-v2': '📖 WeebCentral (Best Manga - 1100+ Chapters HD)',
  'mangakatana-v1': '⚔️ MangaKatana (Massive Manga & Manhua)',
  'synthetiq-manga-v1': '📑 Synthetiq Manga Hub',
  'atsu-v3': '⚡ Atsu Fast Manga Reader',
  'mgread-v1': '🔥 LikeManga / MGRead (Manhwa & Comics)',
  'colorizedmanga-v1': '🎨 Colorized Manga (Full Color Webtoons)',
};

export function getCustomAliases(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_FRIENDLY_NAMES;
}

export function saveCustomAlias(moduleId: string, newName: string): void {
  try {
    const current = getCustomAliases();
    if (!newName.trim()) {
      delete current[moduleId];
    } else {
      current[moduleId] = newName.trim();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('module-aliases-updated'));
  } catch (err) {
    console.error('Failed to save alias:', err);
  }
}

export function resetAllAliases(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FRIENDLY_NAMES));
    window.dispatchEvent(new Event('module-aliases-updated'));
  } catch (_) {}
}

export function getModuleDisplayName(moduleId: string, defaultFallback?: string): string {
  const aliases = getCustomAliases();
  if (aliases[moduleId]) return aliases[moduleId];
  if (DEFAULT_FRIENDLY_NAMES[moduleId]) return DEFAULT_FRIENDLY_NAMES[moduleId];
  return defaultFallback || moduleId;
}
