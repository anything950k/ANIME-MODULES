import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFileSync, spawn } from 'child_process';
import crypto from 'crypto';
import vm from 'vm';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const REPO_DIR = path.join(__dirname, 'repo_data');

app.use(express.json({ limit: '10mb' }));

// Enable CORS for repository consumers (e.g. Synthetiq Player apps)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: safe unzipper for reading entry inside a zip file
function readZipEntry(zipFilePath: string, entryPattern: string): string | null {
  try {
    const listOutput = execFileSync('unzip', ['-Z1', zipFilePath], { encoding: 'utf8' });
    const entries = listOutput.split('\n').map((l) => l.trim()).filter(Boolean);
    const target = entries.find((e) => {
      if (entryPattern.includes('*')) {
        const regex = new RegExp('^' + entryPattern.replace(/\*/g, '.*') + '$', 'i');
        return regex.test(e);
      }
      return e.toLowerCase().endsWith(entryPattern.toLowerCase());
    });
    if (!target) return null;
    return execFileSync('unzip', ['-p', zipFilePath, target], { encoding: 'utf8' });
  } catch (err) {
    console.warn(`Error reading zip entry ${entryPattern} from ${zipFilePath}:`, err);
    return null;
  }
}

// Helper: compute SHA256 of a file
function computeSha256(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

// Helper: check if a module belongs to Anime or Manga
function isAnimeOrManga(m: any): boolean {
  const cat = (m.presentation?.category || '').toLowerCase();
  const id = (m.moduleId || m.id || '').toLowerCase();
  const contentType = (m.contentType || '').toLowerCase();

  // Exclude non-anime/manga modules as well as user-excluded regional/unwanted modules
  if (['movies & tv', 'movies', 'drama', 'cartoons', 'music'].includes(cat)) return false;
  if (
    id.includes('moviedb') || id.includes('xstream') || id.includes('alpha-movies') ||
    id.includes('yflix') || id.includes('dramacool') || id.includes('dramafun') ||
    id.includes('drama-direct') || id.includes('megakino') || id.includes('streamingunity') ||
    id.includes('cimacub') || id.includes('music-hub') || id.includes('kartoons') ||
    id.includes('toontales') || id.includes('shahiid') || id.includes('onepace') ||
    id.includes('aniworld') || id.includes('anime-sama') || id.includes('animeunity') ||
    id.includes('anime4up') || id.includes('colorizedmanga')
  ) {
    return false;
  }
  if (cat === 'anime' || cat === 'manga') return true;
  if (contentType === 'image' || contentType === 'text') return true;
  if (
    id.includes('anime') || id.includes('manga') || id.includes('anikage') ||
    id.includes('anikoto') || id.includes('weeb') ||
    id.includes('miruro') || id.includes('atsu')
  ) {
    return true;
  }
  return false;
}

// Custom user-defined display names for modules
const MODULE_CUSTOM_NAMES: Record<string, string> = {
  'synthetiq-anime-v1': 'Bilibili',
  'synthetiq-anime-direct': 'VidPlay',
  'anikage-v1': 'Koto',
  'kickassanime-v3': 'KickAssAnime',
  'miruro-v3': 'Pahe',
  'synthetiq-one-v1': 'Kage',
  'anikoto-v4': 'Zone',
  'animeav1-v1': 'Wave',
  'animeheaven-v2-1': 'HD-1',
  'justanime-v1': 'HD-2',
  'anipm-v1': 'Kitsu',
  'an1me-v1': 'Synthetiq 1',
  'mugiwara-v1': 'Synthetiq 2',
  'weebcentral-v2': 'WeebCentral',
  'synthetiq-manga-v1': 'Fastest Manga',
  'atsu-v3': 'Atsu Manga',
  'mangakatana-v1': 'MangaKatana',
  'mgread-v1': 'MangaRead',
};

function normalizeAnimeMangaModule(m: any): any {
  const cloned = { ...m, presentation: { ...m.presentation } };
  const id = (cloned.moduleId || cloned.id || '').toLowerCase();
  const contentType = (cloned.contentType || '').toLowerCase();

  if (contentType === 'image' || contentType === 'text' || id.includes('manga') || id.includes('weeb') || id.includes('atsu')) {
    cloned.presentation.category = 'Manga';
  } else {
    cloned.presentation.category = 'Anime';
  }

  // Apply user-defined custom display name if defined
  if (MODULE_CUSTOM_NAMES[id]) {
    cloned.presentation.purpose = MODULE_CUSTOM_NAMES[id];
    cloned.name = MODULE_CUSTOM_NAMES[id];
  }

  return cloned;
}

// In-memory cache for cross-language alternate title resolution
const titleCache = new Map<string, string[]>();

async function resolveAlternateTitles(query: string): Promise<string[]> {
  const qLower = query.toLowerCase().trim();
  if (titleCache.has(qLower)) return titleCache.get(qLower)!;

  const results: string[] = [];

  // Common high-frequency anime aliases
  const COMMON_ALIASES: Record<string, string[]> = {
    'attack on titan': ['Shingeki no Kyojin', "L'Attaque des Titans", "L'Attacco dei Giganti", 'الهجوم على العمالقة'],
    'shingeki no kyojin': ['Attack on Titan', "L'Attaque des Titans", "L'Attacco dei Giganti"],
    'demon slayer': ['Kimetsu no Yaiba'],
    'kimetsu no yaiba': ['Demon Slayer'],
    'my hero academia': ['Boku no Hero Academia'],
    'boku no hero academia': ['My Hero Academia'],
    'jujutsu kaisen': ['Jujutsu Kaisen', 'Sorcery Fight'],
    'chainsaw man': ['Chainsaw Man'],
    'solo leveling': ['Ore dake Level Up na Ken', 'Solo Leveling', 'Na Honja Man Rebeleop'],
    'fullmetal alchemist': ['Hagane no Renkinjutsushi', 'Fullmetal Alchemist: Brotherhood'],
    'death note': ['Death Note'],
    'tokyo revengers': ['Tokyo Revengers'],
    'vinland saga': ['Vinland Saga'],
    'frieren': ['Sousou no Frieren', "Frieren: Beyond Journey's End"],
    "frieren: beyond journey's end": ['Sousou no Frieren', 'Frieren'],
    'mashle': ['Mashle: Magic and Muscles', 'Mashle'],
    'kaiju no. 8': ['Kaijuu 8-gou', 'Kaiju No. 8'],
    'black clover': ['Black Clover'],
    'bleach': ['Bleach', 'Bleach: Sennen Kessen-hen'],
    'naruto': ['Naruto', 'Naruto Shippuden'],
    'one piece': ['One Piece', 'One Piece Film Red'],
  };

  if (COMMON_ALIASES[qLower]) {
    results.push(...COMMON_ALIASES[qLower]);
  }

  // Also query AniList GraphQL with timeout for any anime not in the common dictionary
  try {
    const aniRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `query ($search: String) {
          Media(search: $search, type: ANIME) {
            title { romaji english native }
            synonyms
          }
        }`,
        variables: { search: query }
      }),
      signal: AbortSignal.timeout(2500)
    });
    if (aniRes.ok) {
      const data: any = await aniRes.json();
      const media = data?.data?.Media;
      if (media?.title) {
        if (media.title.romaji && !results.includes(media.title.romaji)) results.push(media.title.romaji);
        if (media.title.english && !results.includes(media.title.english)) results.push(media.title.english);
        if (media.title.native && !results.includes(media.title.native)) results.push(media.title.native);
      }
      if (Array.isArray(media?.synonyms)) {
        for (const syn of media.synonyms) {
          if (syn && !results.includes(syn)) results.push(syn);
        }
      }
    }
  } catch (_) {}

  titleCache.set(qLower, results);
  return results;
}

// -----------------------------------------------------------------------------
// Direct Synthetiq Repository Endpoints
// -----------------------------------------------------------------------------

// 1. repository.json
app.get('/repository.json', (req, res) => {
  const repoJsonPath = path.join(REPO_DIR, 'repository.json');
  if (!fs.existsSync(repoJsonPath)) {
    return res.status(404).json({ error: 'repository.json not found' });
  }
  try {
    const raw = fs.readFileSync(repoJsonPath, 'utf8');
    const data = JSON.parse(raw);
    // Filter only Anime and Manga modules
    data.name = 'Synthetiq Anime & Manga Modules';
    data.modules = (data.modules || []).filter(isAnimeOrManga).map(normalizeAnimeMangaModule);
    data.defaultModules = {
      video: 'synthetiq-anime-v1',
      image: 'weebcentral-v2',
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(data, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. catalogue.json
app.get('/catalogue.json', (req, res) => {
  const catPath = path.join(REPO_DIR, 'catalogue.json');
  if (!fs.existsSync(catPath)) {
    return res.status(404).json({ error: 'catalogue.json not found' });
  }
  res.sendFile(catPath);
});

// 3. SHA256SUMS
app.get('/SHA256SUMS', (req, res) => {
  const sumsPath = path.join(REPO_DIR, 'SHA256SUMS');
  if (!fs.existsSync(sumsPath)) {
    return res.status(404).json({ error: 'SHA256SUMS not found' });
  }
  res.type('text/plain').sendFile(sumsPath);
});

// 4. Module Icons
app.get('/assets/module-icons/:name', (req, res) => {
  const iconPath = path.join(REPO_DIR, 'assets', 'module-icons', req.params.name);
  if (fs.existsSync(iconPath)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(iconPath);
  }
  res.status(404).send('Icon not found');
});

// 5. Binary Module Packages
app.get('/modules/:filename', (req, res) => {
  const filePath = path.join(REPO_DIR, 'modules', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    return res.sendFile(filePath);
  }
  res.status(404).json({ error: 'Module package not found' });
});

// 6. Binary Bundle Packages
app.get('/bundles/:filename', (req, res) => {
  const filePath = path.join(REPO_DIR, 'bundles', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    return res.sendFile(filePath);
  }
  res.status(404).json({ error: 'Bundle package not found' });
});

// 7. Route for GitHub release download URLs referenced in repository.json
// e.g. /kas021/Synthetiq-Modules/releases/download/:tag/:file
app.get('/kas021/Synthetiq-Modules/releases/download/:tag/:file', (req, res) => {
  const filename = req.params.file;
  const modulePath = path.join(REPO_DIR, 'modules', filename);
  if (fs.existsSync(modulePath)) {
    res.setHeader('Content-Type', 'application/zip');
    return res.sendFile(modulePath);
  }
  const bundlePath = path.join(REPO_DIR, 'bundles', filename);
  if (fs.existsSync(bundlePath)) {
    res.setHeader('Content-Type', 'application/zip');
    return res.sendFile(bundlePath);
  }
  res.status(404).json({ error: 'Release package not found on this server' });
});

// -----------------------------------------------------------------------------
// Interactive Management & Sandbox APIs
// -----------------------------------------------------------------------------

// API: Repository Overview
app.get('/api/repository', (req, res) => {
  try {
    const repoJsonPath = path.join(REPO_DIR, 'repository.json');
    const catPath = path.join(REPO_DIR, 'catalogue.json');
    const repoData = JSON.parse(fs.readFileSync(repoJsonPath, 'utf8'));
    const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    const activeModules = (repoData.modules || []).filter(isAnimeOrManga).map(normalizeAnimeMangaModule);
    const modulesCount = activeModules.length;
    const categories: Record<string, number> = {};
    const contentTypes: Record<string, number> = {};

    activeModules.forEach((m: any) => {
      const cat = m.presentation?.category || 'Anime';
      categories[cat] = (categories[cat] || 0) + 1;
      const ct = m.contentType || 'video';
      contentTypes[ct] = (contentTypes[ct] || 0) + 1;
    });

    res.json({
      repositoryId: repoData.repositoryId,
      name: 'Synthetiq Anime & Manga Modules',
      schemaVersion: repoData.schemaVersion,
      bundle: repoData.bundle,
      modulesCount,
      categories,
      contentTypes,
      defaultModules: {
        video: 'synthetiq-anime-v1',
        image: 'weebcentral-v2',
      },
      publishedAtMs: repoData.publishedAtMs,
      hasSignature: !!repoData.signature,
      signature: repoData.signature,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: List All Modules
app.get('/api/modules', (req, res) => {
  try {
    const repoJsonPath = path.join(REPO_DIR, 'repository.json');
    const catPath = path.join(REPO_DIR, 'catalogue.json');
    const repoData = JSON.parse(fs.readFileSync(repoJsonPath, 'utf8'));
    const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    const catFileMap = new Map<string, string>();
    catData.modules?.forEach((cm: any) => {
      const fileName = path.basename(cm.file);
      catFileMap.set(fileName, cm.file);
    });

    const activeRawModules = (repoData.modules || []).filter(isAnimeOrManga).map(normalizeAnimeMangaModule);

    const modules = activeRawModules.map((m: any) => {
      const fileName = path.basename(m.packagePath || m.packageUrl || '');
      const localRelPath = catFileMap.get(fileName) || `modules/${fileName}`;
      const localFullPath = path.join(REPO_DIR, localRelPath);
      const existsOnDisk = fs.existsSync(localFullPath);
      let sizeBytes = 0;
      if (existsOnDisk) {
        sizeBytes = fs.statSync(localFullPath).size;
      }

      // Convert github raw icon url to local server url if present
      let localIconUrl = m.presentation?.iconUrl;
      if (localIconUrl && localIconUrl.includes('raw.githubusercontent.com')) {
        const iconName = path.basename(localIconUrl.split('?')[0]);
        localIconUrl = `/assets/module-icons/${iconName}`;
      }

      return {
        id: m.moduleId,
        familyId: m.moduleFamilyId,
        identity: m.moduleIdentity,
        identityNumber: m.moduleIdentityNumber,
        contentType: m.contentType,
        version: m.version,
        minAppVersion: m.minAppVersion,
        packagePath: m.packagePath,
        packageUrl: m.packageUrl,
        sha256: m.sha256,
        publishedAtMs: m.publishedAtMs,
        changelog: m.changelog || [],
        presentation: {
          ...m.presentation,
          iconUrl: localIconUrl,
          rawIconUrl: m.presentation?.iconUrl,
        },
        localFile: localRelPath,
        sizeBytes,
        existsOnDisk,
      };
    });

    res.json({ modules });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Module Details and Manifest
app.get('/api/module/:id', (req, res) => {
  try {
    const moduleId = req.params.id;
    const catPath = path.join(REPO_DIR, 'catalogue.json');
    const repoJsonPath = path.join(REPO_DIR, 'repository.json');
    const repoData = JSON.parse(fs.readFileSync(repoJsonPath, 'utf8'));
    const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    const moduleMeta = repoData.modules.find((m: any) => m.moduleId === moduleId);
    if (!moduleMeta) {
      return res.status(404).json({ error: `Module ${moduleId} not found in repository` });
    }

    const fileName = path.basename(moduleMeta.packagePath || moduleMeta.packageUrl || '');
    const catItem = catData.modules?.find((cm: any) => cm.file.endsWith(fileName));
    const localRelPath = catItem?.file || `modules/${fileName}`;
    const localFullPath = path.join(REPO_DIR, localRelPath);

    let manifest: any = null;
    let fileList: string[] = [];

    if (fs.existsSync(localFullPath)) {
      const rawManifest = readZipEntry(localFullPath, 'module.json');
      if (rawManifest) {
        try {
          manifest = JSON.parse(rawManifest);
        } catch (_) {}
      }
      try {
        const listOutput = execFileSync('unzip', ['-Z1', localFullPath], { encoding: 'utf8' });
        fileList = listOutput.split('\n').map((l) => l.trim()).filter(Boolean);
      } catch (_) {}
    }

    // Also check if editable source exists in sources/
    const sourceDir = path.join(REPO_DIR, 'sources');
    let hasSource = false;
    let sourcePath = '';
    if (fs.existsSync(sourceDir)) {
      const dirs = fs.readdirSync(sourceDir);
      for (const d of dirs) {
        const p = path.join(sourceDir, d, 'module.json');
        if (fs.existsSync(p)) {
          try {
            const sm = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (sm.id === moduleId || sm.moduleFamilyId === moduleMeta.moduleFamilyId) {
              hasSource = true;
              sourcePath = `sources/${d}`;
              break;
            }
          } catch (_) {}
        }
      }
    }

    res.json({
      metadata: moduleMeta,
      manifest,
      fileList,
      hasSource,
      sourcePath,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Module Code
app.get('/api/module/:id/code', (req, res) => {
  try {
    const moduleId = req.params.id;
    const catPath = path.join(REPO_DIR, 'catalogue.json');
    const repoJsonPath = path.join(REPO_DIR, 'repository.json');
    const repoData = JSON.parse(fs.readFileSync(repoJsonPath, 'utf8'));
    const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    const moduleMeta = repoData.modules.find((m: any) => m.moduleId === moduleId);
    if (!moduleMeta) {
      return res.status(404).json({ error: `Module ${moduleId} not found` });
    }

    // First check if editable source exists in sources/
    const sourceDir = path.join(REPO_DIR, 'sources');
    if (fs.existsSync(sourceDir)) {
      const dirs = fs.readdirSync(sourceDir);
      for (const d of dirs) {
        const p = path.join(sourceDir, d, 'module.json');
        if (fs.existsSync(p)) {
          try {
            const sm = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (sm.id === moduleId || sm.moduleFamilyId === moduleMeta.moduleFamilyId) {
              const indexPath = path.join(sourceDir, d, 'index.js');
              if (fs.existsSync(indexPath)) {
                return res.json({
                  sourceType: 'editable_source',
                  path: `sources/${d}/index.js`,
                  code: fs.readFileSync(indexPath, 'utf8'),
                });
              }
            }
          } catch (_) {}
        }
      }
    }

    // Otherwise read index.js from zip
    const fileName = path.basename(moduleMeta.packagePath || moduleMeta.packageUrl || '');
    const catItem = catData.modules?.find((cm: any) => cm.file.endsWith(fileName));
    const localRelPath = catItem?.file || `modules/${fileName}`;
    const localFullPath = path.join(REPO_DIR, localRelPath);

    if (!fs.existsSync(localFullPath)) {
      return res.status(404).json({ error: `Package file ${localRelPath} not found` });
    }

    const code = readZipEntry(localFullPath, 'index.js');
    if (!code) {
      return res.status(404).json({ error: 'index.js not found in module package' });
    }

    res.json({
      sourceType: 'package_zip',
      path: localRelPath,
      code,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: load and compile module code into a VM sandbox
function loadModuleInVm(code: string) {
  const customFetch = async (url: any, opts: any = {}) => {
    // Provide sensible default User-Agent and timeouts
    const headers = new Headers(opts.headers || {});
    if (!headers.has('User-Agent')) {
      headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36');
    }
    const signal = opts.signal || AbortSignal.timeout(20000);
    const nativeRes = await fetch(url, { ...opts, headers, signal });
    
    // Safely cache body bytes so sequential .text() and .json() calls do not lock the body stream
    const buffer = await nativeRes.arrayBuffer();
    const textBody = Buffer.from(buffer).toString('utf8');

    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(textBody);
    } catch (_) {
      parsedJson = null;
    }

    return {
      status: nativeRes.status,
      ok: nativeRes.ok,
      statusText: nativeRes.statusText,
      headers: nativeRes.headers,
      body: textBody,
      text: async () => textBody,
      json: async () => {
        if (parsedJson !== null) return parsedJson;
        return JSON.parse(textBody);
      },
      arrayBuffer: async () => buffer,
    };
  };

  const fetchv2 = async (url: string, headers: any = {}, method: string = 'GET', body: any = null, options: any = {}) => {
    const hdrs = new Headers(headers || {});
    if (!hdrs.has('User-Agent')) {
      hdrs.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36');
    }
    const signal = options.signal || AbortSignal.timeout(20000);
    const nativeRes = await fetch(url, {
      method: method || 'GET',
      headers: hdrs,
      body: body || undefined,
      signal,
    });
    const buffer = await nativeRes.arrayBuffer();
    const textBody = Buffer.from(buffer).toString('utf8');

    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(textBody);
    } catch (_) {
      parsedJson = null;
    }

    const resHeaders: Record<string, string> = {};
    nativeRes.headers.forEach((val, key) => {
      resHeaders[key.toLowerCase()] = val;
    });

    return {
      status: nativeRes.status,
      ok: nativeRes.ok,
      headers: resHeaders,
      body: textBody,
      text: async () => textBody,
      json: async () => {
        if (parsedJson !== null) return parsedJson;
        return JSON.parse(textBody);
      },
    };
  };

  const sandbox: any = {
    console: {
      log: (...args: any[]) => {
        const msg = args.map((a) => String(a)).join(' ');
        if (msg.includes('probe failed') && msg.includes('not_hls')) return;
        console.log('[Sandbox]', ...args);
      },
      warn: (...args: any[]) => {
        const msg = args.map((a) => String(a)).join(' ');
        if (msg.includes('probe failed') && msg.includes('not_hls')) return;
        console.warn('[Sandbox Warn]', ...args);
      },
      error: (...args: any[]) => console.error('[Sandbox Err]', ...args),
      info: (...args: any[]) => console.info('[Sandbox Info]', ...args),
    },
    fetch: customFetch,
    fetchv2,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
    URL: globalThis.URL,
    URLSearchParams: globalThis.URLSearchParams,
    atob: globalThis.atob,
    btoa: globalThis.btoa,
    crypto: globalThis.crypto,
    TextDecoder: globalThis.TextDecoder,
    TextEncoder: globalThis.TextEncoder,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    Promise: globalThis.Promise,
    Array: globalThis.Array,
    Object: globalThis.Object,
    String: globalThis.String,
    Number: globalThis.Number,
    Boolean: globalThis.Boolean,
    Date: globalThis.Date,
    Math: globalThis.Math,
    JSON: globalThis.JSON,
    RegExp: globalThis.RegExp,
    Error: globalThis.Error,
    Map: globalThis.Map,
    Set: globalThis.Set,
    Uint8Array: globalThis.Uint8Array,
    Buffer: globalThis.Buffer,
  };

  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;

  const vmContext = vm.createContext(sandbox);
  vm.runInContext(code, vmContext, { timeout: 15000 });
  return vmContext;
}

// API: Live Sandbox Runner
app.post('/api/module/run', async (req, res) => {
  const startTime = Date.now();
  try {
    const { moduleId, action, params = {} } = req.body;
    if (!moduleId || !action) {
      return res.status(400).json({ error: 'moduleId and action are required' });
    }

    // Find module package
    const repoJsonPath = path.join(REPO_DIR, 'repository.json');
    const catPath = path.join(REPO_DIR, 'catalogue.json');
    const repoData = JSON.parse(fs.readFileSync(repoJsonPath, 'utf8'));
    const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    const moduleMeta = repoData.modules.find((m: any) => m.moduleId === moduleId);
    if (!moduleMeta || !isAnimeOrManga(moduleMeta)) {
      return res.status(404).json({ error: `Module ${moduleId} not found or disabled (only Anime and Manga providers are active)` });
    }

    let code: string | null = null;
    let sourceLabel = '';

    // Check sources first
    const sourceDir = path.join(REPO_DIR, 'sources');
    if (fs.existsSync(sourceDir)) {
      const dirs = fs.readdirSync(sourceDir);
      for (const d of dirs) {
        const p = path.join(sourceDir, d, 'module.json');
        if (fs.existsSync(p)) {
          try {
            const sm = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (sm.id === moduleId || sm.moduleFamilyId === moduleMeta.moduleFamilyId) {
              const indexPath = path.join(sourceDir, d, 'index.js');
              if (fs.existsSync(indexPath)) {
                code = fs.readFileSync(indexPath, 'utf8');
                sourceLabel = `sources/${d}/index.js`;
                break;
              }
            }
          } catch (_) {}
        }
      }
    }

    if (!code) {
      const fileName = path.basename(moduleMeta.packagePath || moduleMeta.packageUrl || '');
      const catItem = catData.modules?.find((cm: any) => cm.file.endsWith(fileName));
      const localRelPath = catItem?.file || `modules/${fileName}`;
      const localFullPath = path.join(REPO_DIR, localRelPath);
      if (!fs.existsSync(localFullPath)) {
        try {
          const downloadUrl = `https://raw.githubusercontent.com/kas021/Synthetiq-Modules/main/${localRelPath}`;
          const dlRes = await fetch(downloadUrl);
          if (dlRes.ok) {
            fs.mkdirSync(path.dirname(localFullPath), { recursive: true });
            const buf = Buffer.from(await dlRes.arrayBuffer());
            fs.writeFileSync(localFullPath, buf);
          }
        } catch (_) {}
      }
      if (!fs.existsSync(localFullPath)) {
        return res.status(404).json({ error: `Package zip ${localRelPath} not found` });
      }
      code = readZipEntry(localFullPath, 'index.js');
      sourceLabel = localRelPath;
    }

    if (!code) {
      return res.status(500).json({ error: 'Could not load index.js for module' });
    }

    const context = loadModuleInVm(code);

    let result: any = null;
    switch (action) {
      case 'discoveryHome': {
        if (typeof context.discoveryHome !== 'function') {
          throw new Error('Module does not implement discoveryHome()');
        }
        result = await context.discoveryHome();
        break;
      }
      case 'discoveryFeed': {
        if (typeof context.discoveryFeed !== 'function') {
          throw new Error('Module does not implement discoveryFeed(feedId, page)');
        }
        result = await context.discoveryFeed(params.feedId || 'home', params.page || 1);
        break;
      }
      case 'searchResults': {
        if (typeof context.searchResults !== 'function') {
          throw new Error('Module does not implement searchResults(query, page)');
        }
        const initialQuery = (params.query ?? '').trim();
        if (!initialQuery) {
          result = [];
          break;
        }
        result = await context.searchResults(initialQuery, params.page || 1);

        // Auto-fallback: If no results found (e.g. searching English names in regional providers like AniDB, Zoro, Bort, Synthetiq 3),
        // resolve Romaji / native / synonyms and auto-retry to retrieve the content
        if ((!result || (Array.isArray(result) && result.length === 0)) && initialQuery.trim().length > 1) {
          const alternateTitles = await resolveAlternateTitles(initialQuery);
          for (const alt of alternateTitles) {
            if (alt.toLowerCase().trim() === initialQuery.toLowerCase().trim()) continue;
            try {
              const retryRes = await context.searchResults(alt, params.page || 1);
              if (Array.isArray(retryRes) && retryRes.length > 0) {
                result = retryRes;
                break;
              }
            } catch (_) {}
          }
        }
        break;
      }
      case 'extractDetails': {
        if (typeof context.extractDetails !== 'function') {
          throw new Error('Module does not implement extractDetails(id)');
        }
        const targetId = params.id || params.seriesId || params.mangaHref;
        result = await context.extractDetails(targetId);
        break;
      }
      case 'extractEpisodes': {
        const targetId = params.id || params.seriesId || params.mangaHref;
        if (typeof context.extractEpisodes === 'function') {
          result = await context.extractEpisodes(targetId);
        } else if (typeof context.extractChapters === 'function') {
          result = await context.extractChapters(targetId);
        } else {
          throw new Error('Module does not implement extractEpisodes or extractChapters');
        }
        break;
      }
      case 'extractChapters': {
        const targetId = params.id || params.seriesId || params.mangaHref;
        if (typeof context.extractChapters !== 'function') {
          throw new Error('Module does not implement extractChapters(id)');
        }
        result = await context.extractChapters(targetId);
        break;
      }
      case 'extractStreamUrl': {
        if (typeof context.extractStreamUrl !== 'function') {
          throw new Error('Module does not implement extractStreamUrl(episodeRef, subOrDub)');
        }
        result = await context.extractStreamUrl(params.episodeRef || params.id, params.subOrDub || 'sub');
        break;
      }
      case 'extractImages': {
        const chapterTarget = params.chapterId || params.id || params.chapterHref;
        if (typeof context.extractImages !== 'function') {
          throw new Error('Module does not implement extractImages(chapterId)');
        }
        result = await context.extractImages(chapterTarget);
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported action: ${action}` });
    }

    const durationMs = Date.now() - startTime;
    const jsonString = JSON.stringify(result || null);
    const payloadSizeBytes = Buffer.byteLength(jsonString, 'utf8');

    // Quality check per checklist: payload must stay under 2 MiB app bridge limit
    const exceedsBudget = payloadSizeBytes > 2 * 1024 * 1024;

    res.json({
      ok: true,
      action,
      moduleId,
      sourceLabel,
      durationMs,
      payloadSizeBytes,
      exceedsBudget,
      result,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('Run module error:', err);
    res.status(500).json({
      ok: false,
      durationMs,
      error: err.message || String(err),
      stack: err.stack,
    });
  }
});

// API: Advanced HLS Stream and Media Proxy
app.get(['/api/stream/proxy', '/api/proxy/media'], async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    const referer = (req.query.referer as string) || '';
    if (!rawUrl) {
      return res.status(400).send('Missing url param');
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      Accept: '*/*',
    };
    if (referer) {
      headers['Referer'] = referer;
      try {
        const u = new URL(referer);
        headers['Origin'] = u.origin;
      } catch (_) {}
    }

    // Support range requests for video seeking/scrubbing
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const upstream = await fetch(rawUrl, { headers });
    res.status(upstream.status);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

    const upstreamContentType = upstream.headers.get('content-type') || '';
    const isM3U8 =
      rawUrl.includes('.m3u8') ||
      upstreamContentType.includes('mpegurl') ||
      upstreamContentType.includes('application/x-mpegURL');

    if (isM3U8) {
      const text = await upstream.text();
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      // Rewrite URLs inside m3u8 playlist so child playlists and segments also pass through the proxy
      const lines = text.split('\n');
      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // If line is a comment or metadata tag
        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/g, (match, uriVal) => {
              try {
                const abs = new URL(uriVal, rawUrl).href;
                const proxied = `/api/stream/proxy?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(referer)}`;
                return `URI="${proxied}"`;
              } catch (_) {
                return match;
              }
            });
          }
          return line;
        }

        // If line is a URI (relative or absolute)
        try {
          const abs = new URL(trimmed, rawUrl).href;
          return `/api/stream/proxy?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(referer)}`;
        } catch (_) {
          return line;
        }
      });

      return res.send(rewrittenLines.join('\n'));
    }

    // Forward binary content, segment bytes, or image files
    if (upstreamContentType) res.setHeader('Content-Type', upstreamContentType);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    const acceptRanges = upstream.headers.get('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const arrayBuffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Stream proxy error:', err);
    if (!res.headersSent) {
      res.status(500).send(err.message);
    }
  }
});

// API: Run Repository Test Suites
app.post('/api/tests/run', (req, res) => {
  try {
    const { suite } = req.body;
    let scriptFile = '';

    if (suite === 'anikage') {
      scriptFile = path.join(REPO_DIR, 'scripts', 'anikage_module.test.cjs');
    } else if (suite === 'weebcentral') {
      scriptFile = path.join(REPO_DIR, 'scripts', 'weebcentral_chapter_order.test.cjs');
    } else if (suite === 'release_guard') {
      scriptFile = path.join(REPO_DIR, 'scripts', 'public_release_guard.test.mjs');
    } else {
      return res.status(400).json({ error: 'Unknown test suite' });
    }

    if (!fs.existsSync(scriptFile)) {
      return res.status(404).json({ error: `Test script ${scriptFile} not found` });
    }

    const output = execFileSync('node', [scriptFile], {
      cwd: REPO_DIR,
      encoding: 'utf8',
      timeout: 10000,
    });

    // Parse TAP test results
    const lines = output.split('\n');
    const tests: Array<{ name: string; ok: boolean; durationMs?: number }> = [];
    let currentTest: any = null;

    lines.forEach((line) => {
      const okMatch = line.match(/^(ok|not ok)\s+(\d+)\s+-\s+(.+)$/);
      if (okMatch) {
        if (currentTest) tests.push(currentTest);
        currentTest = {
          name: okMatch[3].trim(),
          ok: okMatch[1] === 'ok',
        };
      }
      const durMatch = line.match(/duration_ms:\s*([0-9.]+)/);
      if (durMatch && currentTest) {
        currentTest.durationMs = parseFloat(durMatch[1]);
      }
    });
    if (currentTest) tests.push(currentTest);

    const totalPassed = tests.filter((t) => t.ok).length;
    const totalFailed = tests.filter((t) => !t.ok).length;

    res.json({
      suite,
      success: totalFailed === 0,
      total: tests.length,
      passed: totalPassed,
      failed: totalFailed,
      tests,
      rawOutput: output,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      output: err.stdout || err.output?.[1] || '',
      stderr: err.stderr || err.output?.[2] || '',
    });
  }
});

// API: Verify Repository Checksums
app.post('/api/verify/checksums', (req, res) => {
  try {
    const sumsPath = path.join(REPO_DIR, 'SHA256SUMS');
    if (!fs.existsSync(sumsPath)) {
      return res.status(404).json({ error: 'SHA256SUMS file missing' });
    }

    const content = fs.readFileSync(sumsPath, 'utf8');
    const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    const results = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return null;
      const expectedHash = parts[0].toLowerCase();
      const relativeFile = parts[1];
      const fullPath = path.join(REPO_DIR, relativeFile);

      if (!fs.existsSync(fullPath)) {
        return {
          file: relativeFile,
          expectedHash,
          actualHash: null,
          exists: false,
          valid: false,
        };
      }

      const actualHash = computeSha256(fullPath).toLowerCase();
      return {
        file: relativeFile,
        expectedHash,
        actualHash,
        exists: true,
        valid: actualHash === expectedHash,
      };
    }).filter(Boolean);

    const allValid = results.every((r) => r && r.valid);
    res.json({
      allValid,
      totalChecked: results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: List Docs and Checklists
app.get('/api/docs', (req, res) => {
  try {
    const docsDir = path.join(REPO_DIR, 'docs');
    if (!fs.existsSync(docsDir)) {
      return res.json({ docs: [] });
    }
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md') || f.endsWith('.json'));
    res.json({ docs: files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Read Specific Doc
app.get('/api/doc/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    // Security check to avoid path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid file name' });
    }
    const filePath = path.join(REPO_DIR, 'docs', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Doc not found' });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ filename, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -----------------------------------------------------------------------------
// Vite Frontend Middleware / Static Serving
// -----------------------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Synthetiq Modules Hub & Repository running at http://0.0.0.0:${port}`);
    console.log(`📦 Repository URL for Player: http://0.0.0.0:${port}/repository.json`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
