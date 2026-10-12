import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  ArrowLeft,
  Trash2,
  Clock,
  Disc3,
  Layers,
  Flame,
  Moon,
  Coffee,
  Heart,
} from 'lucide-react';
import { Playlist, Song } from '../../types/music';

interface PlaylistsScreenProps {
  playlists: Playlist[];
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  selectedPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist | null) => void;
}

export const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({
  playlists,
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onCreatePlaylist,
  onDeletePlaylist,
  selectedPlaylist,
  onSelectPlaylist,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  if (selectedPlaylist) {
    const playlistSongs = songs.filter((s) => selectedPlaylist.songIds.includes(s.id));

    return (
      <div className="space-y-4 pb-28 pt-2">
        <button
          onClick={() => onSelectPlaylist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-fit active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Playlists
        </button>

        <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-white/15">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-xl">
            <img
              src={selectedPlaylist.coverArt || (playlistSongs[0]?.artwork)}
              alt={selectedPlaylist.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
              {selectedPlaylist.isSmart ? 'Smart Mix' : 'Playlist'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
              {selectedPlaylist.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {selectedPlaylist.description || 'Audio collection'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {playlistSongs.length} tracks
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button
                onClick={() => {
                  if (playlistSongs.length > 0) onPlaySong(playlistSongs[0]);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Play Playlist
              </button>

              {selectedPlaylist.isCustom && (
                <button
                  onClick={() => onDeletePlaylist(selectedPlaylist.id)}
                  aria-label="Delete Playlist"
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {playlistSongs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-xs text-slate-400">
              This playlist is currently empty. Add songs from the Songs screen!
            </div>
          ) : (
            playlistSongs.map((song, idx) => {
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
                    <span className="text-xs font-mono text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySong(song);
                      }}
                      aria-label={`Play ${song.title}`}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-slate-950 flex items-center justify-center text-white transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const smartPlaylists = playlists.filter((p) => p.isSmart);
  const userPlaylists = playlists.filter((p) => !p.isSmart);

  return (
    <div className="space-y-5 pb-28 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Playlists &amp; Mixes
          </h1>
          <p className="text-xs text-slate-400">
            Smart local algorithmic mixes &amp; custom user playlists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Playlist
        </button>
      </div>

      {/* Smart Playlists Section */}
      {smartPlaylists.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Disc3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Smart Local Mixes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {smartPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist)}
                className="glass-panel p-3.5 rounded-3xl flex items-center gap-3.5 cursor-pointer hover:border-cyan-400/40 transition-all group"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow group-hover:scale-105 transition-transform">
                  <img
                    src={playlist.coverArt}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {playlist.description}
                  </p>
                  <p className="text-[11px] font-mono text-cyan-300 mt-1">
                    {playlist.songIds.length} tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* User Playlists Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
          Custom Playlists ({userPlaylists.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className="glass-panel p-3.5 rounded-3xl flex items-center gap-3.5 cursor-pointer hover:border-cyan-400/40 transition-all group"
            >
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow group-hover:scale-105 transition-transform">
                <img
                  src={playlist.coverArt}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {playlist.description || 'Custom playlist'}
                </p>
                <p className="text-[11px] font-mono text-cyan-300 mt-1">
                  {playlist.songIds.length} tracks
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass-panel p-5 rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95"
          >
            <h3 className="text-base font-bold text-white mb-3">Create Playlist</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <textarea
                placeholder="Description (Optional)"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
