import React from 'react';
import { Play, Pause, SkipForward, Heart, Maximize2 } from 'lucide-react';
import { Song } from '../types/music';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenNowPlaying: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onToggleFavorite,
  onOpenNowPlaying,
}) => {
  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div
        onClick={onOpenNowPlaying}
        className="pointer-events-auto max-w-md mx-auto relative rounded-2xl glass-panel p-2.5 flex items-center justify-between gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] cursor-pointer hover:border-cyan-500/40 transition-all duration-300 group"
      >
        {/* Top subtle progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Artwork + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : 'scale-100'} transition-transform duration-500`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-white truncate tracking-tight group-hover:text-cyan-300 transition-colors">
                {currentSong.title}
              </h4>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/20">
                {currentSong.format || 'Hi-Res'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            aria-label={currentSong.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              currentSong.isFavorite
                ? 'text-rose-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={currentSong.isFavorite ? 'currentColor' : 'none'}
            />
          </button>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.35)] transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 text-slate-950 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Next Track"
            aria-label="Next Track"
            className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-transform"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onOpenNowPlaying}
            title="Expand Now Playing"
            aria-label="Expand Now Playing"
            className="p-2 rounded-full text-slate-400 hover:text-white active:scale-90 transition-transform"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
