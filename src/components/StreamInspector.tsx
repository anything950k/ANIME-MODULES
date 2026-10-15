import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Film, 
  BookOpen, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Copy,
  Subtitles,
  Server,
  Zap,
  Radio,
  ArrowLeft,
  X
} from 'lucide-react';

interface StreamInspectorProps {
  mediaData: {
    type: 'video' | 'manga';
    title: string;
    content: any;
  } | null;
  onClose?: () => void;
}

export const StreamInspector: React.FC<StreamInspectorProps> = ({ mediaData, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedVlc, setCopiedVlc] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manga reader state
  const [currentPage, setCurrentPage] = useState(0);
  const [viewStyle, setViewStyle] = useState<'scroll' | 'single'>('scroll');

  const streamInfo = mediaData?.type === 'video' ? mediaData.content : null;
  const mangaPages: string[] =
    mediaData?.type === 'manga' && Array.isArray(mediaData.content) ? mediaData.content : [];

  // Determine current active stream URL and headers
  const currentServer = streamInfo?.servers?.[selectedServerIndex] || null;
  const currentStreamUrl = currentServer?.url || streamInfo?.url || '';
  const currentHeaders = currentServer?.headers || streamInfo?.headers || {};
  const subtitlesList = currentServer?.subtitles || streamInfo?.subtitles || [];
  const refererHeader =
    currentHeaders.Referer ||
    currentHeaders.referer ||
    'https://megaplay.buzz/';

  const proxiedStreamUrl = currentStreamUrl
    ? `/api/stream/proxy?url=${encodeURIComponent(currentStreamUrl)}&referer=${encodeURIComponent(refererHeader)}`
    : '';

  const activePlayUrl = useProxy ? proxiedStreamUrl : currentStreamUrl;

  useEffect(() => {
    if (!videoRef.current || !activePlayUrl) return;
    setPlayerError(null);

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (activePlayUrl.includes('.m3u8') || activePlayUrl.includes('mpegurl') || activePlayUrl.includes('proxy')) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(activePlayUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsPlaying(true);
          video.play().catch(() => {
            // Autoplay might need user interaction in some browsers
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn('HLS fatal error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setPlayerError(
                  `Network error loading media. If direct CDN blocked access, ensure 'In-App Stream Proxy' is active.`
                );
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setPlayerError('Media decode error. Attempting recovery...');
                hls?.recoverMediaError();
                break;
              default:
                setPlayerError(`Stream error: ${data.details}`);
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = activePlayUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = activePlayUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activePlayUrl, selectedServerIndex, useProxy]);

  const copyUrl = () => {
    if (currentStreamUrl) {
      navigator.clipboard.writeText(currentStreamUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const copyVlcCommand = () => {
    const vlcCmd = `vlc --http-referrer="${refererHeader}" "${currentStreamUrl}"`;
    navigator.clipboard.writeText(vlcCmd);
    setCopiedVlc(true);
    setTimeout(() => setCopiedVlc(false), 2000);
  };

  if (!mediaData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <div className="rounded-2xl bg-zinc-800 p-4 text-zinc-500 mb-4">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Active Media Selected</h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          Search for an Anime in the <strong>Sandbox Runner</strong>, click <strong>"Episodes &amp; Stream"</strong>, and pick any episode to start streaming!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
            {mediaData.type === 'video' ? <Film className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{mediaData.title}</span>
              {mediaData.type === 'video' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live Stream Ready
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              {mediaData.type === 'video'
                ? `Active Video Stream • ${streamInfo?.servers?.length || 1} Server Route(s) • Quality: ${streamInfo?.quality || 'Auto / 1080p'}`
                : `Manga Chapter • ${mangaPages.length} Clean HD Pages`}
            </p>
          </div>
        </div>

        {mediaData.type === 'video' && currentStreamUrl && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Proxy Toggle */}
            <button
              onClick={() => setUseProxy(!useProxy)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                useProxy
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
              }`}
              title="Bypasses CDN Referer & CORS security walls"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{useProxy ? 'Proxy Stream: ON (Active)' : 'Proxy Stream: OFF'}</span>
            </button>

            <button
              onClick={copyVlcCommand}
              title="Copy VLC command to stream with required Referer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              {copiedVlc ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedVlc ? 'Copied VLC Cmd' : 'Copy VLC Cmd'}</span>
            </button>

            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? 'Copied URL' : 'Copy Raw URL'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Video Inspector View */}
      {mediaData.type === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Screen */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
              {playerError && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-300 space-y-3">
                  <div className="rounded-full bg-amber-500/10 p-3 text-amber-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-white text-sm">Playback Notice</div>
                  <p className="max-w-md text-zinc-400">
                    {playerError}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setUseProxy(true)}
                      className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      Turn On In-App Stream Proxy
                    </button>
                    <button
                      onClick={copyVlcCommand}
                      className="rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                    >
                      Copy VLC Streaming Command
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Route Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Active Stream Route
                </h4>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {useProxy ? 'Proxied via /api/stream/proxy' : 'Direct External CDN'}
                </span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="rounded bg-zinc-950 p-2.5 text-indigo-300 break-all border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] font-sans">Resolved Stream URL:</span>
                  {currentStreamUrl || 'None'}
                </div>

                <div className="rounded bg-zinc-950 p-2.5 text-zinc-300 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 block text-[10px] font-sans">CDN Headers Injected:</span>
                  <div className="text-[11px]">
                    <span className="text-zinc-400">Referer:</span> {refererHeader}
                  </div>
                  {currentHeaders['User-Agent'] && (
                    <div className="text-[11px] truncate">
                      <span className="text-zinc-400">User-Agent:</span> {currentHeaders['User-Agent']}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Server & Captions Selection */}
          <div className="space-y-4">
            {/* Servers List */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Server className="h-4 w-4 text-indigo-400" />
                <span>Available Server Routes ({streamInfo?.servers?.length || 1})</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(streamInfo?.servers || [{ name: 'Default Primary Route', url: currentStreamUrl }]).map(
                  (srv: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedServerIndex(idx)}
                      className={`w-full text-left rounded-lg p-2.5 text-xs transition-all cursor-pointer ${
                        selectedServerIndex === idx
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{srv.server || srv.name || `Server ${idx + 1}`}</span>
                        {srv.type && (
                          <span className="text-[10px] opacity-80 uppercase px-1 rounded bg-black/30">
                            {srv.type}
                          </span>
                        )}
                      </div>
                      {srv.quality && (
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Quality: {srv.quality}
                        </div>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Subtitles List */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                <Subtitles className="h-4 w-4 text-sky-400" />
                <span>Subtitles ({subtitlesList.length})</span>
              </div>

              {subtitlesList.length > 0 ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {subtitlesList.map((sub: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-zinc-950 p-2 text-xs border border-zinc-800"
                    >
                      <span className="text-zinc-300">{sub.label || sub.lang || `Track ${idx + 1}`}</span>
                      <a
                        href={sub.file || sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-400 hover:underline"
                      >
                        VTT Link
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 py-2">
                  Hardsubbed in video or stream renditions embedded in manifest.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manga Gallery View */}
      {mediaData.type === 'manga' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">
              Total Pages: <strong className="text-white">{mangaPages.length}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewStyle(viewStyle === 'scroll' ? 'single' : 'scroll')}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 cursor-pointer"
              >
                {viewStyle === 'scroll' ? 'Switch to Single Page' : 'Switch to Webtoon Scroll'}
              </button>
            </div>
          </div>

          {viewStyle === 'scroll' ? (
            <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
              {mangaPages.map((pageUrl, idx) => {
                const proxiedUrl = `/api/stream/proxy?url=${encodeURIComponent(pageUrl)}&referer=https://weebcentral.com/`;
                return (
                  <div key={idx} className="relative w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800/60 shadow">
                    <img
                      src={proxiedUrl}
                      onError={(e) => {
                        // If proxy fails, try direct URL
                        if (e.currentTarget.src !== pageUrl) {
                          e.currentTarget.src = pageUrl;
                        }
                      }}
                      alt={`Page ${idx + 1}`}
                      className="w-full object-contain"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white font-mono">
                      {idx + 1} / {mangaPages.length}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 max-w-xl mx-auto">
              <div className="relative w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                <img
                  src={`/api/stream/proxy?url=${encodeURIComponent(mangaPages[currentPage] || '')}&referer=https://weebcentral.com/`}
                  onError={(e) => {
                    if (e.currentTarget.src !== mangaPages[currentPage]) {
                      e.currentTarget.src = mangaPages[currentPage];
                    }
                  }}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full object-contain"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage <= 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-zinc-400 font-mono">
                  {currentPage + 1} of {mangaPages.length}
                </span>
                <button
                  disabled={currentPage >= mangaPages.length - 1}
                  onClick={() => setCurrentPage((p) => Math.min(mangaPages.length - 1, p + 1))}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
