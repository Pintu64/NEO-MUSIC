import React, { useState } from 'react';
import { Play, ArrowLeft, Disc3, Clock, Shuffle } from 'lucide-react';
import { Album, Song } from '../../types/music';

interface AlbumsScreenProps {
  albums: Album[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  selectedAlbum: Album | null;
  onSelectAlbum: (album: Album | null) => void;
}

export const AlbumsScreen: React.FC<AlbumsScreenProps> = ({
  albums,
  currentSong,
  isPlaying,
  onPlaySong,
  selectedAlbum,
  onSelectAlbum,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If an album is opened, show album detail view
  if (selectedAlbum) {
    return (
      <div className="space-y-5 pb-28 pt-2">
        <button
          onClick={() => onSelectAlbum(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-fit active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Albums
        </button>

        {/* Album Header Banner */}
        <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-white/15">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/20">
            <img
              src={selectedAlbum.artwork}
              alt={selectedAlbum.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
              Album
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
              {selectedAlbum.title}
            </h1>
            <p className="text-sm text-slate-300 font-medium mt-0.5">
              {selectedAlbum.artist} • {selectedAlbum.year || 2026}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {selectedAlbum.songs.length} audio tracks
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button
                onClick={() => {
                  if (selectedAlbum.songs.length > 0) {
                    onPlaySong(selectedAlbum.songs[0]);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Play Album
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-2">
          {selectedAlbum.songs.map((song, index) => {
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
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
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
          })}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="space-y-4 pb-28 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Albums
        </h1>
        <p className="text-xs text-slate-400">
          {albums.length} releases discovered
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {albums.map((album) => (
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
    </div>
  );
};
