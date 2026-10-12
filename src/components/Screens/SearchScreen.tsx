import React, { useState, useMemo } from 'react';
import { Search, X, Play, Disc3, Layers, User, Folder } from 'lucide-react';
import { Song, Album, Artist } from '../../types/music';

interface SearchScreenProps {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectAlbum: (album: Album) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  songs,
  albums,
  artists,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectAlbum,
}) => {
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, query]);

  const filteredAlbums = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [albums, query]);

  const filteredArtists = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [artists, query]);

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
        <input
          type="text"
          placeholder="Search songs, artists, albums, folders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-slate-900/90 border border-white/20 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-xl transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div className="glass-panel p-6 rounded-3xl text-center border border-white/10 space-y-2">
          <Disc3 className="w-10 h-10 text-cyan-400/50 mx-auto animate-[spin_12s_linear_infinite]" />
          <h3 className="text-base font-bold text-white">
            Instant MediaStore Search
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Type any song name, artist, or album to find lossless tracks instantly across your device storage.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Songs results */}
          {filteredSongs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                Songs ({filteredSongs.length})
              </h3>
              <div className="space-y-2">
                {filteredSongs.map((song) => {
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
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {song.artist} • {song.album}
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
            </div>
          )}

          {/* Albums results */}
          {filteredAlbums.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                Albums ({filteredAlbums.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onSelectAlbum(album)}
                    className="glass-panel p-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-cyan-400/40 transition-all"
                  >
                    <img
                      src={album.artwork}
                      alt={album.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {album.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {album.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredSongs.length === 0 &&
            filteredAlbums.length === 0 &&
            filteredArtists.length === 0 && (
              <div className="glass-panel p-8 rounded-3xl text-center border border-white/10 text-xs text-slate-400">
                No matching results found for "{query}".
              </div>
            )}
        </div>
      )}
    </div>
  );
};
