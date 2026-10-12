import React from 'react';
import {
  Play,
  Shuffle,
  FolderOpen,
  Sliders,
  Disc3,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Upload,
  Dices,
  Coffee,
  Heart,
  Moon,
  Flame,
  Music,
  Globe,
  FolderDown,
} from 'lucide-react';
import { Song, Album, Playlist, AppScreen } from '../../types/music';
import { getSurpriseTrack, getLocalRecommendations } from '../../services/smartAudio';

interface HomeScreenProps {
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onShuffleAll: () => void;
  onNavigate: (screen: AppScreen) => void;
  onOpenEqualizer: () => void;
  onImportClick: () => void;
  onSelectAlbum: (album: Album) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  songs,
  albums,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onShuffleAll,
  onNavigate,
  onOpenEqualizer,
  onImportClick,
  onSelectAlbum,
  onSelectPlaylist,
}) => {
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const surpriseSong = getSurpriseTrack(songs, currentSong?.id);
  const recommendations = getLocalRecommendations(songs, currentSong);
  const downloadedCount = songs.filter((s) => s.isDownloaded).length;

  const handleSurpriseMe = () => {
    if (surpriseSong) {
      onPlaySong(surpriseSong);
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl p-5 sm:p-6 glass-panel overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Ambient glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-bold tracking-wider text-slate-300 uppercase">
                NeoMusic Engine
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>Direct PCM</span>
              <span aria-hidden="true">·</span>
              <span>Bit-Exact Pipeline</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
            Studio-grade lossless audio engine • 100% Ad-free &amp; private
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={onShuffleAll}
              className="px-3.5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle ({songs.length})
            </button>

            {/* Surprise Track Button */}
            <button
              onClick={handleSurpriseMe}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
            >
              <Dices className="w-3.5 h-3.5 text-cyan-400" />
              Surprise Track
            </button>

            <button
              onClick={() => onNavigate('online')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Online Music
            </button>

            {downloadedCount > 0 && (
              <button
                onClick={() => onNavigate('songs')}
                className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 border border-emerald-400/30 active:scale-95 transition-all"
              >
                <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
                Downloaded ({downloadedCount})
              </button>
            )}

            <button
              onClick={onImportClick}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Import
            </button>

            <button
              onClick={onOpenEqualizer}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Equalizer
            </button>
          </div>
        </div>
      </div>

      {/* Curated Soundscapes & Mixes */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Curated Soundscapes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('playlists')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            All playlists <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {playlists.slice(0, 4).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="glass-panel p-3.5 rounded-2xl cursor-pointer hover:border-cyan-400/40 transition-all group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-2 border border-white/10">
                <img
                  src={pl.coverArt}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-cyan-300 font-bold">
                  {pl.songIds.length} tracks
                </span>
              </div>
              <h3 className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                {pl.name}
              </h3>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for You based on local listen history */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Recommended From Your Library
              </h2>
            </div>
          </div>

          <div className="space-y-2">
            {recommendations.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`glass-panel p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-cyan-500/40 ${
                    isCurrent ? 'border-cyan-500/40 bg-cyan-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist} • {song.genre || 'Audio'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySong(song);
                    }}
                    aria-label={`Play ${song.title}`}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-slate-950 flex items-center justify-center text-white transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Albums Grid */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Featured Albums
            </h2>
          </div>
          <button
            onClick={() => onNavigate('albums')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {albums.slice(0, 4).map((album) => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className="glass-panel p-3 rounded-2xl cursor-pointer hover:border-cyan-400/40 transition-all group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/10 shadow-lg">
                <img
                  src={album.artwork}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-white border border-white/20">
                  {album.trackCount} tracks
                </div>
              </div>
              <p className="text-xs font-bold text-white truncate tracking-tight">
                {album.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {album.artist}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Pledge Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-emerald-500/20 bg-emerald-950/10 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              100% Ad-Free &amp; Offline Privacy
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              NeoMusic contains zero banner ads, zero video interstitials, and zero tracking SDKs. All audio files and library metadata remain stored strictly on your local device.
            </p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Cpu className="w-3.5 h-3.5" /> High Performance DSP
              </span>
              <span>•</span>
              <span className="text-cyan-400">AndroidX Media3 ExoPlayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
