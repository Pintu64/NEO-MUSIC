import React, { useState, useMemo } from 'react';
import {
  Play,
  Shuffle,
  Search,
  ArrowUpDown,
  Upload,
  Heart,
  MoreVertical,
  PlusCircle,
  ListPlus,
  Music,
  Filter,
  CheckCircle2,
  FolderDown,
  Trash2,
} from 'lucide-react';
import { Song, Playlist } from '../../types/music';

interface SongsScreenProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onShuffleAll: () => void;
  onImportClick: () => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onDeleteDownloadedSong?: (songId: string) => void;
}

export const SongsScreen: React.FC<SongsScreenProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayNext,
  onAddToQueue,
  onToggleFavorite,
  onShuffleAll,
  onImportClick,
  onAddToPlaylist,
  onDeleteDownloadedSong,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration' | 'date'>('date');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'downloaded' | 'favorites'>('all');
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const downloadedCount = useMemo(() => songs.filter((s) => s.isDownloaded).length, [songs]);
  const favoritesCount = useMemo(() => songs.filter((s) => s.isFavorite).length, [songs]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.genre) set.add(s.genre);
    });
    return Array.from(set);
  }, [songs]);

  const filteredAndSortedSongs = useMemo(() => {
    let result = songs.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q);

      const matchesGenre =
        selectedGenre === 'all' || (s.genre && s.genre.toLowerCase() === selectedGenre.toLowerCase());

      const matchesScope =
        scopeFilter === 'all'
          ? true
          : scopeFilter === 'downloaded'
          ? Boolean(s.isDownloaded)
          : Boolean(s.isFavorite);

      return matchesSearch && matchesGenre && matchesScope;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'date') return (b.dateAdded || 0) - (a.dateAdded || 0);
      return 0;
    });

    return result;
  }, [songs, searchQuery, sortBy, selectedGenre, scopeFilter]);

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            All Songs
          </h1>
          <p className="text-xs text-slate-400">
            {songs.length} audio tracks in local library
          </p>
        </div>

        <button
          onClick={onImportClick}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Search and Sort Row */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, artist, album, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-900/80 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 appearance-none pr-8 cursor-pointer"
          >
            <option value="date">Newest</option>
            <option value="title">Title (A-Z)</option>
            <option value="artist">Artist</option>
            <option value="duration">Duration</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Scope Filter Chips (All, Downloaded Offline, Favorites) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setScopeFilter('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold ${
            scopeFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          All Songs ({songs.length})
        </button>
        <button
          onClick={() => setScopeFilter('downloaded')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 font-semibold ${
            scopeFilter === 'downloaded'
              ? 'bg-emerald-400 text-slate-950 font-bold shadow'
              : 'bg-white/5 text-emerald-300/80 hover:bg-white/10'
          }`}
        >
          <FolderDown className="w-3.5 h-3.5" />
          Downloaded ({downloadedCount})
        </button>
        <button
          onClick={() => setScopeFilter('favorites')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 font-semibold ${
            scopeFilter === 'favorites'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'bg-white/5 text-rose-300/80 hover:bg-white/10'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Favorites ({favoritesCount})
        </button>
      </div>

      {/* Genre Filter Pills */}
      {genres.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              selectedGenre === 'all'
                ? 'bg-white/20 text-white font-bold border border-white/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                selectedGenre.toLowerCase() === g.toLowerCase()
                  ? 'bg-white/20 text-white font-bold border border-white/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Batch Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            if (filteredAndSortedSongs.length > 0) {
              onPlaySong(filteredAndSortedSongs[0]);
            }
          }}
          className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Play All
        </button>

        <button
          onClick={onShuffleAll}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 border border-cyan-400/30 active:scale-95 transition-all"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Smart Shuffle
        </button>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {filteredAndSortedSongs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border border-white/10">
            <Music className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-white">No tracks match your query</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try searching for something else or import new audio files from storage.
            </p>
          </div>
        ) : (
          filteredAndSortedSongs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isMenuOpen = activeMenuSongId === song.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`glass-panel p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-cyan-500/40 relative group ${
                  isCurrent ? 'border-cyan-500/40 bg-cyan-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                    {index + 1}
                  </span>

                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      {song.isDownloaded ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono shrink-0 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Offline MP3
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-cyan-300 font-mono shrink-0">
                          {song.format || 'Audio'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {song.artist} • {song.album} {song.genre ? `• ${song.genre}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    {formatDuration(song.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    aria-label={song.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className={`p-1.5 rounded-full transition-all ${
                      song.isFavorite
                        ? 'text-rose-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={song.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>

                  {/* Options 3-dot dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuSongId(isMenuOpen ? null : song.id);
                      }}
                      aria-label="Track options"
                      className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 bottom-8 sm:bottom-auto sm:top-8 w-44 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl z-30 flex flex-col gap-1 text-xs animate-in fade-in"
                      >
                        {song.isDownloaded && onDeleteDownloadedSong && (
                          <button
                            onClick={() => {
                              onDeleteDownloadedSong(song.id);
                              setActiveMenuSongId(null);
                            }}
                            className="px-3 py-1.5 rounded-xl hover:bg-rose-500/20 text-left text-rose-300 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            Delete Download
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onPlayNext(song);
                            setActiveMenuSongId(null);
                          }}
                          className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-left text-slate-200 flex items-center gap-2"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                          Play Next
                        </button>
                        <button
                          onClick={() => {
                            onAddToQueue(song);
                            setActiveMenuSongId(null);
                          }}
                          className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-left text-slate-200 flex items-center gap-2"
                        >
                          <ListPlus className="w-3.5 h-3.5 text-emerald-400" />
                          Add to Queue
                        </button>

                        <div className="border-t border-white/10 my-1 pt-1 px-2 text-[10px] text-slate-400 uppercase font-mono">
                          Add to playlist:
                        </div>
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              onAddToPlaylist(pl.id, song.id);
                              setActiveMenuSongId(null);
                            }}
                            className="px-3 py-1 rounded-xl hover:bg-white/10 text-left text-slate-300 truncate"
                          >
                            {pl.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
