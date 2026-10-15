/**
 * Multilingual Title Mapping Engine for Anime & Manga
 * Supports English, Romaji, Japanese Native (Kanji/Kana), Korean (Hangul), and common international titles.
 */

export interface TitleMapping {
  english: string;
  romaji: string;
  native?: string;
  synonyms?: string[];
  korean?: string;
  french?: string;
  spanish?: string;
}

export const KNOWN_MULTILINGUAL_CATALOG: TitleMapping[] = [
  {
    english: 'Attack on Titan',
    romaji: 'Shingeki no Kyojin',
    native: '進撃の巨人',
    synonyms: ['SnK', 'AoT', "L'Attaque des Titans", 'Ataque a los Titanes', "L'Attacco dei Giganti", 'الهجوم على العمالقة'],
  },
  {
    english: 'Demon Slayer: Kimetsu no Yaiba',
    romaji: 'Kimetsu no Yaiba',
    native: '鬼滅の刃',
    synonyms: ['Demon Slayer', 'Blade of Demon Destruction', 'Guardianes de la Noche'],
  },
  {
    english: 'Jujutsu Kaisen',
    romaji: 'Jujutsu Kaisen',
    native: '呪術廻戦',
    synonyms: ['JJK', 'Sorcery Fight', '주술회전'],
  },
  {
    english: 'My Hero Academia',
    romaji: 'Boku no Hero Academia',
    native: '僕のヒーローアカデミア',
    synonyms: ['BnHA', 'MHA', '나의 히어로 아카데미아'],
  },
  {
    english: 'Solo Leveling',
    romaji: 'Ore dake Level Up na Ken',
    native: '俺だけレベルアップな件',
    korean: '나 혼자만 레벨업',
    synonyms: ['Na Honja Man Rebeleop', 'I Level Up Alone', 'Solo Leveling: Arise'],
  },
  {
    english: "Frieren: Beyond Journey's End",
    romaji: 'Sousou no Frieren',
    native: '葬送のフリーレン',
    synonyms: ['Frieren', 'Frieren at the Funeral'],
  },
  {
    english: 'Chainsaw Man',
    romaji: 'Chainsaw Man',
    native: 'チェンソーマン',
    synonyms: ['CSM', '체인소 맨'],
  },
  {
    english: 'One Piece',
    romaji: 'One Piece',
    native: 'ワンピース',
    synonyms: ['OP', '원피스', '海贼王'],
  },
  {
    english: 'Naruto',
    romaji: 'Naruto',
    native: 'ナルト',
    synonyms: ['Naruto Shippuden', '나루토', '火影忍者'],
  },
  {
    english: 'Bleach',
    romaji: 'Bleach',
    native: 'ブリーチ',
    synonyms: ['Bleach: Thousand-Year Blood War', 'Bleach: Sennen Kessen-hen', '블리치'],
  },
  {
    english: 'Death Note',
    romaji: 'Death Note',
    native: 'デスノート',
    synonyms: ['데스노트'],
  },
  {
    english: 'Fullmetal Alchemist: Brotherhood',
    romaji: 'Hagane no Renkinjutsushi: Fullmetal Alchemist',
    native: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    synonyms: ['FMA', 'FMAB', 'Hagane no Renkinjutsushi', '강철의 연금술사'],
  },
  {
    english: 'Hunter x Hunter',
    romaji: 'Hunter x Hunter',
    native: 'ハンター×ハンター',
    synonyms: ['HxH', '헌터바이헌터'],
  },
  {
    english: 'Tokyo Ghoul',
    romaji: 'Tokyo Ghoul',
    native: '東京喰種トーキョーグール',
    synonyms: ['도쿄 구울'],
  },
  {
    english: 'Sword Art Online',
    romaji: 'Sword Art Online',
    native: 'ソードアート・オンライン',
    synonyms: ['SAO', '소드 아트 온라인'],
  },
  {
    english: 'Spy x Family',
    romaji: 'Spy x Family',
    native: 'スパイファミリー',
    synonyms: ['스파이 패밀리'],
  },
  {
    english: 'Vinland Saga',
    romaji: 'Vinland Saga',
    native: 'ヴィンランド・サガ',
    synonyms: ['빈란드 사가'],
  },
  {
    english: 'Berserk',
    romaji: 'Berserk',
    native: 'ベルセルク',
    synonyms: ['베르세르크'],
  },
  {
    english: 'Tokyo Revengers',
    romaji: 'Tokyo Revengers',
    native: '東京卍リベンジャーズ',
    synonyms: ['도쿄 리벤저스'],
  },
  {
    english: 'Dandadan',
    romaji: 'Dandadan',
    native: 'ダンダダン',
    synonyms: ['Dan Da Dan', '단다단'],
  },
  {
    english: 'Blue Lock',
    romaji: 'Blue Lock',
    native: 'ブルーロック',
    synonyms: ['블루 록'],
  },
  {
    english: 'Kaiju No. 8',
    romaji: 'Kaijuu 8-gou',
    native: '怪獣8号',
    synonyms: ['Monster #8', '괴수 8호'],
  },
  {
    english: 'Mushoku Tensei: Jobless Reincarnation',
    romaji: 'Mushoku Tensei: Isekai Ittara Honki Dasu',
    native: '無職転生 ～異世界行ったら本気だす～',
    synonyms: ['Mushoku Tensei', 'Jobless Reincarnation', '무직전생'],
  },
  {
    english: 'Oshi no Ko',
    romaji: 'Oshi no Ko',
    native: '【推しの子】',
    synonyms: ['My Star', '최애의 아이'],
  },
  {
    english: 'Hell\'s Paradise',
    romaji: 'Jigokuraku',
    native: '地獄楽',
    synonyms: ['Jigokuraku: Hell\'s Paradise', '지옥락'],
  },
  {
    english: 'Mashle: Magic and Muscles',
    romaji: 'Mashle',
    native: 'マッシュル-MASHLE-',
    synonyms: ['매슈를'],
  },
  {
    english: 'Black Clover',
    romaji: 'Black Clover',
    native: 'ブラッククローバー',
    synonyms: ['블랙 클로버'],
  },
  {
    english: 'Dr. Stone',
    romaji: 'Dr. Stone',
    native: 'ドクターストーン',
    synonyms: ['닥터 스톤'],
  },
  {
    english: 'Tower of God',
    romaji: 'Kami no Tou',
    native: '神之塔',
    korean: '신의 탑',
    synonyms: ['Sin-ui Tap', 'Kami no Tou: Tower of God'],
  },
  {
    english: 'Omniscient Reader',
    romaji: 'Jeonjijeok Dokja Sijeom',
    native: '全知的読者視点',
    korean: '전지적 독자 시점',
    synonyms: ['Omniscient Reader\'s Viewpoint', 'ORV'],
  },
  {
    english: 'Haikyu!!',
    romaji: 'Haikyuu!!',
    native: 'ハイキュー!!',
    synonyms: ['하이큐!!'],
  },
  {
    english: 'Steins;Gate',
    romaji: 'Steins;Gate',
    native: 'シュタインズ・ゲート',
    synonyms: ['슈타인즈 게이트'],
  },
  {
    english: 'Re:Zero - Starting Life in Another World',
    romaji: 'Re:Zero kara Hajimeru Isekai Seikatsu',
    native: 'Re:ゼロから始める異世界生活',
    synonyms: ['Re:Zero', 'ReZero', '리제로'],
  },
  {
    english: 'Mob Psycho 100',
    romaji: 'Mob Psycho 100',
    native: 'モブサイコ100',
    synonyms: ['모브 사이코 100'],
  },
  {
    english: 'Neon Genesis Evangelion',
    romaji: 'Shin Seiki Evangelion',
    native: '新世紀エヴァンゲリオン',
    synonyms: ['Evangelion', 'NGE', '에반게리온'],
  },
  {
    english: 'Cowboy Bebop',
    romaji: 'Cowboy Bebop',
    native: 'カウボーイビバップ',
    synonyms: ['카우보이 비밥'],
  },
  {
    english: 'Code Geass: Lelouch of the Rebellion',
    romaji: 'Code Geass: Hangyaku no Lelouch',
    native: 'コードギアス 反逆のルルーシュ',
    synonyms: ['Code Geass', '코드 기어스'],
  },
  {
    english: 'Boruto: Naruto Next Generations',
    romaji: 'Boruto: Naruto Next Generations',
    native: 'BORUTO-ボルト- NARUTO NEXT GENERATIONS',
    synonyms: ['Boruto', 'Boruto: Two Blue Vortex', '보루토'],
  },
];

// Dynamic cache for titles fetched via GraphQL
const remoteTitleCache = new Map<string, TitleMapping>();

/**
 * Resolves a query against the known catalog or queries AniList API.
 * Returns an array of search variants in order of relevance:
 * [originalQuery, romajiTitle, nativeTitle, englishTitle, ...synonyms]
 */
export async function getMultilingualSearchVariants(
  query: string
): Promise<{ primary: string; mapping: TitleMapping | null; allVariants: string[] }> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) {
    return { primary: query, mapping: null, allVariants: [query] };
  }

  // 1. Search in local catalog
  const match = KNOWN_MULTILINGUAL_CATALOG.find((item) => {
    if (item.english.toLowerCase() === cleanQ) return true;
    if (item.romaji.toLowerCase() === cleanQ) return true;
    if (item.native && item.native.toLowerCase() === cleanQ) return true;
    if (item.korean && item.korean.toLowerCase() === cleanQ) return true;
    if (item.synonyms && item.synonyms.some((s) => s.toLowerCase() === cleanQ)) return true;

    // Substring match for longer queries
    if (cleanQ.length > 3) {
      if (item.english.toLowerCase().includes(cleanQ)) return true;
      if (item.romaji.toLowerCase().includes(cleanQ)) return true;
    }
    return false;
  });

  if (match) {
    const variants = new Set<string>();
    variants.add(query.trim());
    if (match.romaji) variants.add(match.romaji);
    if (match.english) variants.add(match.english);
    if (match.native) variants.add(match.native);
    if (match.korean) variants.add(match.korean);
    if (match.synonyms) {
      for (const s of match.synonyms) variants.add(s);
    }
    return { primary: query, mapping: match, allVariants: Array.from(variants) };
  }

  // 2. Check remote cache
  if (remoteTitleCache.has(cleanQ)) {
    const cached = remoteTitleCache.get(cleanQ)!;
    const variants = new Set<string>();
    variants.add(query.trim());
    if (cached.romaji) variants.add(cached.romaji);
    if (cached.english) variants.add(cached.english);
    if (cached.native) variants.add(cached.native);
    if (cached.synonyms) cached.synonyms.forEach((s) => variants.add(s));
    return { primary: query, mapping: cached, allVariants: Array.from(variants) };
  }

  // 3. Fallback: Query AniList GraphQL API for real-time multilingual titles
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              title {
                romaji
                english
                native
              }
              synonyms
            }
          }
        `,
        variables: { search: query.trim() },
      }),
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      const media = data?.data?.Media;
      if (media?.title) {
        const dynamicMapping: TitleMapping = {
          english: media.title.english || query.trim(),
          romaji: media.title.romaji || query.trim(),
          native: media.title.native || undefined,
          synonyms: Array.isArray(media.synonyms) ? media.synonyms : [],
        };
        remoteTitleCache.set(cleanQ, dynamicMapping);

        const variants = new Set<string>();
        variants.add(query.trim());
        if (dynamicMapping.romaji) variants.add(dynamicMapping.romaji);
        if (dynamicMapping.english) variants.add(dynamicMapping.english);
        if (dynamicMapping.native) variants.add(dynamicMapping.native);
        dynamicMapping.synonyms?.forEach((s) => variants.add(s));

        return { primary: query, mapping: dynamicMapping, allVariants: Array.from(variants) };
      }
    }
  } catch (_) {
    // If offline or timeout, continue with original query
  }

  return { primary: query, mapping: null, allVariants: [query.trim()] };
}
