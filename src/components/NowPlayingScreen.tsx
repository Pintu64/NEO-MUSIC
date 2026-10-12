import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Sliders,
  ListMusic,
  Clock,
  Gauge,
  Volume2,
  FileText,
  Radio,
  X,
  Trash2,
  Download,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Song, RepeatMode } from '../types/music';
import { AudioEngine } from '../services/audioEngine';

interface NowPlayingScreenProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Song[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackSpeed: number;
  sleepTimerMinutes: number | null;
  skipIntervalSeconds?: number;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onSeekRelative: (seconds: number) => void;
  onToggleFavorite: (songId: string) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenEqualizer: () => void;
  onPlaySongFromQueue: (song: Song) => void;
  onRemoveFromQueue: (songId: string) => void;
  onDownloadSong?: (song: Song) => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  queue,
  repeatMode,
  isShuffle,
  playbackSpeed,
  sleepTimerMinutes,
  skipIntervalSeconds = 10,
  isDownloaded = false,
  isDownloading = false,
  downloadProgress = 0,
  onClose,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onSeekRelative,
  onToggleFavorite,
  onToggleRepeat,
  onToggleShuffle,
  onSetPlaybackSpeed,
  onSetSleepTimer,
  onOpenEqualizer,
  onPlaySongFromQueue,
  onRemoveFromQueue,
  onDownloadSong,
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'visualizer'>('cover');
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Real-time Canvas Spectrum Visualizer
  useEffect(() => {
    if (activeTab !== 'visualizer') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const data = AudioEngine.getInstance().getSpectrumData();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / 32 - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const val = data[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * (canvas.height - 20));

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(0.5, '#4facfe');
        gradient.addColorStop(1, '#ff007f');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
        ctx.fillRect(x, canvas.height, barWidth, barHeight * 0.25);

        x += barWidth + 2;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07090e] text-white overflow-hidden select-none animate-in fade-in duration-300">
      {/* Dynamic ambient backlight blurred from album artwork */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-[100px] transition-all duration-1000 scale-125"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentSong.accentColor || '#00f2fe'} 0%, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-[#07090e] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={onClose}
          aria-label="Minimize player"
          className="p-2 rounded-full glass-panel hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
            Now Playing
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-cyan-300 font-medium">
              Audio Engine • {currentSong.sampleRate || '44.1 kHz'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenEqualizer}
          aria-label="Equalizer"
          className="p-2 rounded-full glass-panel hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-cyan-300"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </header>

      {/* Center View Selector Tabs (Cover / Visualizer / Lyrics) */}
      <div className="relative z-10 flex justify-center my-2">
        <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'cover'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              activeTab === 'visualizer'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Visualizer
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              activeTab === 'lyrics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Lyrics
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        {activeTab === 'cover' && (
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-3xl overflow-hidden glass-panel p-2 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/20 transition-transform duration-500 hover:scale-[1.02]">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-t-2xl pointer-events-none" />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="w-full max-w-md h-[260px] rounded-3xl glass-panel p-4 flex flex-col justify-end items-center border border-white/15">
            <span className="text-xs font-mono text-cyan-300/80 mb-2">
              REAL-TIME 32-BAND FFT SPECTRUM
            </span>
            <canvas
              ref={canvasRef}
              width={360}
              height={180}
              className="w-full h-full rounded-xl"
            />
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full max-w-md h-[280px] rounded-3xl glass-panel p-5 overflow-y-auto border border-white/15 text-center space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">
              Embedded Lyrics
            </span>
            {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
              currentSong.lyrics.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm sm:text-base font-medium transition-colors ${
                    idx === 2
                      ? 'text-cyan-300 font-bold scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic pt-12">
                No embedded lyrics found for this track.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Song Info & Scrubber & Controls */}
      <footer className="relative z-10 px-6 pb-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 pr-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate tracking-tight">
              {currentSong.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-300 font-medium truncate">
                {currentSong.artist}
              </p>
              <span className="text-slate-600">•</span>
              <p className="text-xs text-slate-400 truncate">
                {currentSong.album}
              </p>
              {isDownloaded || currentSong.isDownloaded ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Offline
                </span>
              ) : currentSong.isOnline ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 shrink-0">
                  Online Stream
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download offline action */}
            {onDownloadSong && (
              <button
                onClick={() => onDownloadSong(currentSong)}
                disabled={isDownloading}
                title={
                  isDownloaded || currentSong.isDownloaded
                    ? 'Saved offline (Download again)'
                    : isDownloading
                    ? `Downloading: ${downloadProgress}%`
                    : 'Download .MP3 to Device'
                }
                aria-label="Download song"
                className={`p-3 rounded-2xl glass-panel transition-all active:scale-90 ${
                  isDownloaded || currentSong.isDownloaded
                    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10'
                    : isDownloading
                    ? 'text-purple-300 border-purple-400/40 bg-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:border-purple-400/40'
                }`}
              >
                {isDownloading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                ) : isDownloaded || currentSong.isDownloaded ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Download className="w-6 h-6" />
                )}
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              aria-label={currentSong.isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-3 rounded-2xl glass-panel transition-all active:scale-90 ${
                currentSong.isFavorite
                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart
                className="w-6 h-6"
                fill={currentSong.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Seek Bar Scrubber */}
        <div className="space-y-1 mb-4">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:h-2.5 transition-all"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-400 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onToggleShuffle}
            title={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
            aria-label={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
            className={`p-2.5 rounded-full transition-all ${
              isShuffle
                ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Configurable Rewind */}
          <button
            onClick={() => onSeekRelative(-skipIntervalSeconds)}
            title={`Rewind ${skipIntervalSeconds} seconds`}
            aria-label={`Rewind ${skipIntervalSeconds} seconds`}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all flex items-center gap-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] font-mono">{skipIntervalSeconds}</span>
          </button>

          <button
            onClick={onPrev}
            title="Previous Track"
            aria-label="Previous Track"
            className="p-3 rounded-full text-slate-200 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-95 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_30px_rgba(0,242,254,0.5)] transition-all"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-slate-950 text-slate-950" />
            ) : (
              <Play className="w-7 h-7 fill-slate-950 text-slate-950 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Next Track"
            aria-label="Next Track"
            className="p-3 rounded-full text-slate-200 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Configurable Forward */}
          <button
            onClick={() => onSeekRelative(skipIntervalSeconds)}
            title={`Forward ${skipIntervalSeconds} seconds`}
            aria-label={`Forward ${skipIntervalSeconds} seconds`}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all flex items-center gap-0.5"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[10px] font-mono">{skipIntervalSeconds}</span>
          </button>

          <button
            onClick={onToggleRepeat}
            title={`Repeat mode: ${repeatMode}`}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-2.5 rounded-full transition-all ${
              repeatMode !== 'off'
                ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Utility Tools */}
        <div className="flex items-center justify-around pt-2 border-t border-white/10 text-xs text-slate-400">
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>{playbackSpeed}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-10 left-0 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-30 min-w-[80px]">
                {[0.5, 0.8, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onSetPlaybackSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-left text-xs ${
                      playbackSpeed === s
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Timer'}</span>
            </button>
            {showSleepTimerMenu && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-30 min-w-[100px]">
                <button
                  onClick={() => {
                    onSetSleepTimer(null);
                    setShowSleepTimerMenu(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-left text-xs ${
                    sleepTimerMinutes === null
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Off
                </button>
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onSetSleepTimer(mins);
                      setShowSleepTimerMenu(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-left text-xs ${
                      sleepTimerMinutes === mins
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowQueueSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <ListMusic className="w-4 h-4 text-emerald-400" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>
      </footer>

      {/* Queue Drawer Sheet */}
      {showQueueSheet && (
        <div
          onClick={() => setShowQueueSheet(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-end animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-auto bg-slate-950/95 border-t border-white/20 rounded-t-3xl p-5 max-h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Playback Queue</h3>
                <span className="text-xs text-slate-400">({queue.length} songs)</span>
              </div>
              <button
                onClick={() => setShowQueueSheet(false)}
                aria-label="Close Queue"
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-white/5 py-2">
              {queue.map((song, idx) => {
                const isCurrent = song.id === currentSong.id;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => {
                      onPlaySongFromQueue(song);
                      setShowQueueSheet(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-slate-400 w-5">
                        {idx + 1}
                      </span>
                      <img
                        src={song.artwork}
                        alt={song.title}
                        className="w-9 h-9 rounded-lg object-cover border border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-white">
                          {song.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        {formatTime(song.duration)}
                      </span>
                      {queue.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromQueue(song.id);
                          }}
                          aria-label="Remove from queue"
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
