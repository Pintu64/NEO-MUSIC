import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Heart,
  Sliders,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Globe,
  Radio,
  Loader2,
  Move,
  Pin,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Song, DynamicCapsuleSettings } from '../types/music';

interface DynamicCapsuleProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering?: boolean;
  currentTime: number;
  duration: number;
  settings: DynamicCapsuleSettings;
  skipIntervalSeconds?: number;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onDownloadSong?: (song: Song) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onSeekRelative: (seconds: number) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenNowPlaying: () => void;
  onOpenEqualizer: () => void;
  onToggleFloatingOverlay?: () => void;
}

export const DynamicCapsule: React.FC<DynamicCapsuleProps> = ({
  currentSong,
  isPlaying,
  isBuffering = false,
  currentTime,
  duration,
  settings,
  skipIntervalSeconds = 10,
  isDownloaded = false,
  isDownloading = false,
  downloadProgress = 0,
  onDownloadSong,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onSeekRelative,
  onToggleFavorite,
  onOpenNowPlaying,
  onOpenEqualizer,
  onToggleFloatingOverlay,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!settings.enabled || !currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Auto-collapse after inactivity when expanded
  useEffect(() => {
    if (isExpanded && settings.autoCollapseSeconds > 0) {
      const timer = window.setTimeout(() => {
        setIsExpanded(false);
      }, settings.autoCollapseSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, settings.autoCollapseSeconds]);

  const handlePillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  // Draggable floating mode handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!settings.overlayMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && settings.overlayMode) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`fixed z-50 transition-transform ${
        settings.overlayMode ? 'cursor-grab' : 'top-3 left-1/2 -translate-x-1/2'
      }`}
      style={{
        top: settings.overlayMode ? `${Math.max(10, settings.positionY + dragOffset.y)}px` : undefined,
        left: settings.overlayMode ? `calc(50% + ${dragOffset.x}px)` : undefined,
        transform: settings.overlayMode ? 'translateX(-50%)' : undefined,
      }}
    >
      {/* 1. COMPACT PILL-SHAPED POPUP */}
      {!isExpanded ? (
        <div
          onMouseDown={handleMouseDown}
          onClick={handlePillClick}
          className={`group cursor-pointer select-none flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-3xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.18)] transition-all duration-300 hover:scale-[1.03] hover:border-cyan-400/50 ${
            settings.size === 'compact'
              ? 'scale-90'
              : settings.size === 'large'
              ? 'scale-110'
              : ''
          }`}
        >
          {/* Circular artwork with live progress ring & vinyl spinner */}
          <div className="relative w-8 h-8 rounded-full shrink-0 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="absolute -inset-0.5 w-9 h-9 -rotate-90 pointer-events-none">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={currentSong.accentColor || '#00f2fe'}
                strokeWidth="2"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (100.5 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Artwork thumbnail */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 shadow-inner relative">
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className={`w-full h-full object-cover ${
                  isPlaying && !isBuffering ? 'animate-[spin_10s_linear_infinite]' : ''
                }`}
              />
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Marquee Title & Source / Artist */}
          <div className="flex flex-col max-w-[130px] sm:max-w-[190px] overflow-hidden">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[13px] font-semibold text-white tracking-tight truncate">
                {currentSong.title}
              </span>
              {currentSong.isOnline && (
                <span className="shrink-0 text-[8px] font-mono px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Online
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-cyan-300/80 font-medium truncate">
              {currentSong.isStreamPreview && (
                <span className="text-amber-400 font-bold shrink-0">Preview •</span>
              )}
              <span className="truncate">{currentSong.artist}</span>
            </div>
          </div>

          {/* Animated sound wave bars */}
          {settings.showWaveform && (
            <div className="flex items-center gap-[2.5px] h-3.5 px-1 shrink-0">
              {isBuffering ? (
                <Loader2 className="w-3 h-3 text-cyan-300 animate-spin" />
              ) : (
                [0.4, 0.9, 0.6, 1.0, 0.5].map((scale, i) => (
                  <div
                    key={i}
                    className="w-[2.5px] rounded-full bg-gradient-to-t from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{
                      height: isPlaying ? `${Math.max(4, scale * 14)}px` : '3px',
                      animation: isPlaying
                        ? `pulse ${0.6 + i * 0.15}s ease-in-out infinite alternate`
                        : 'none',
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* Working Play/Pause quick icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all shrink-0 ml-0.5"
          >
            {isBuffering ? (
              <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
            )}
          </button>
        </div>
      ) : (
        /* 2. EXPANDED DYNAMIC ISLAND MODAL */
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[340px] sm:w-[390px] rounded-3xl p-5 bg-slate-950/95 backdrop-blur-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,242,254,0.22)] transition-all duration-400 animate-in fade-in zoom-in-95 text-white"
        >
          {/* Specular glass reflection */}
          <div className="absolute top-0 left-0 right-0 h-16 rounded-t-3xl bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />

          {/* Header pill bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                NeoMusic Dynamic Capsule
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                {currentSong.isOnline ? currentSong.source?.toUpperCase() : currentSong.format || 'LOCAL'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onToggleFloatingOverlay && (
                <button
                  onClick={onToggleFloatingOverlay}
                  title={settings.overlayMode ? 'Dock at Top' : 'Floating Draggable Mode'}
                  aria-label="Toggle floating mode"
                  className={`p-1.5 rounded-full transition-colors ${
                    settings.overlayMode
                      ? 'text-cyan-400 bg-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={onOpenNowPlaying}
                title="Fullscreen Now Playing"
                aria-label="Fullscreen Now Playing"
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="Collapse to Pill"
                aria-label="Collapse to Pill"
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Song info & artwork row */}
          <div className="flex items-center gap-4 my-2">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/15">
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white truncate tracking-tight">
                {currentSong.title}
              </h4>
              <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                {currentSong.artist}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {currentSong.isOnline ? (
                  <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded font-mono truncate">
                    {currentSong.sourceLabel || 'Online Stream'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    {currentSong.album}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onDownloadSong && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadSong(currentSong);
                  }}
                  disabled={isDownloading}
                  title={
                    isDownloaded || currentSong.isDownloaded
                      ? 'Saved Offline (Tap to save copy)'
                      : isDownloading
                      ? `Downloading: ${downloadProgress}%`
                      : 'Download .MP3 to Device'
                  }
                  aria-label="Download song to device"
                  className={`p-2 rounded-full transition-transform active:scale-90 ${
                    isDownloaded || currentSong.isDownloaded
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : isDownloading
                      ? 'text-purple-300 bg-purple-500/20 animate-pulse'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  ) : isDownloaded || currentSong.isDownloaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                onClick={() => onToggleFavorite(currentSong.id)}
                aria-label={currentSong.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-2.5 rounded-full transition-transform active:scale-90 ${
                  currentSong.isFavorite
                    ? 'text-rose-400 bg-rose-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart
                  className="w-5 h-5"
                  fill={currentSong.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          {/* Scrubber progress */}
          <div className="my-3 space-y-1">
            <div className="relative flex items-center group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback action controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onOpenEqualizer}
              title="Equalizer"
              aria-label="Open Equalizer"
              className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSeekRelative(-skipIntervalSeconds)}
              title={`Rewind ${skipIntervalSeconds}s`}
              aria-label={`Rewind ${skipIntervalSeconds} seconds`}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-xs font-mono flex items-center gap-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px]">{skipIntervalSeconds}</span>
            </button>

            <button
              onClick={onPrev}
              title="Previous Track"
              aria-label="Previous Track"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 active:scale-95 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all"
            >
              {isBuffering ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950 text-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 text-slate-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              title="Next Track"
              aria-label="Next Track"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => onSeekRelative(skipIntervalSeconds)}
              title={`Forward ${skipIntervalSeconds}s`}
              aria-label={`Forward ${skipIntervalSeconds} seconds`}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-xs font-mono flex items-center gap-0.5"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px]">{skipIntervalSeconds}</span>
            </button>

            <button
              onClick={onOpenNowPlaying}
              title="Now Playing Screen"
              aria-label="Now Playing Screen"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
