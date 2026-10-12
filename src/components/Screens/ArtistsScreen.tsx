import React, { useState } from 'react';
import { ArrowLeft, User, Play, Disc3 } from 'lucide-react';
import { Artist, Song } from '../../types/music';

interface ArtistsScreenProps {
  artists: Artist[];
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
}

export const ArtistsScreen: React.FC<ArtistsScreenProps> = ({
  artists,
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
}) => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const artistSongs = selectedArtist
    ? songs.filter((s) => s.artist.toLowerCase() === selectedArtist.name.toLowerCase())
    : [];

  if (selectedArtist) {
    return (
      <div className="space-y-5 pb-28 pt-2">
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-fit active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Artists
        </button>

        <div className="glass-panel p-5 rounded-3xl flex items-center gap-5 border border-white/15">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/50 shadow-xl">
            <img
              src={selectedArtist.artwork}
              alt={selectedArtist.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
              Artist
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {selectedArtist.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {artistSongs.length} tracks • {selectedArtist.albumCount} album
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {artistSongs.map((song, idx) => {
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
                      {song.album}
                    </p>
                  </div>
                </div>

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
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Artists
        </h1>
        <p className="text-xs text-slate-400">
          {artists.length} artists in your library
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artists.map((artist) => (
          <div
            key={artist.id}
            onClick={() => setSelectedArtist(artist)}
            className="glass-panel p-4 rounded-3xl flex flex-col items-center text-center cursor-pointer hover:border-cyan-400/40 transition-all group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white/20 shadow-md group-hover:scale-105 transition-transform duration-300">
              <img
                src={artist.artwork}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-sm font-bold text-white truncate w-full">
              {artist.name}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {artist.trackCount} tracks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
