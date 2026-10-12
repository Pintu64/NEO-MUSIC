import React, { useState } from 'react';
import { Folder, FolderOpen, Play, FileAudio, ArrowLeft, HardDrive } from 'lucide-react';
import { Song } from '../../types/music';

interface FoldersScreenProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
}

export const FoldersScreen: React.FC<FoldersScreenProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group songs by folder
  const folderMap = songs.reduce((acc, song) => {
    const f = song.folder || '/storage/emulated/0/Music';
    if (!acc[f]) acc[f] = [];
    acc[f].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  const folders = Object.keys(folderMap);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (selectedFolder) {
    const folderSongs = folderMap[selectedFolder] || [];
    return (
      <div className="space-y-4 pb-28 pt-2">
        <button
          onClick={() => setSelectedFolder(null)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-fit active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Folders
        </button>

        <div className="glass-panel p-4 rounded-3xl flex items-center justify-between border border-white/15">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {selectedFolder.split('/').pop() || 'Folder'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {selectedFolder}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (folderSongs.length > 0) onPlaySong(folderSongs[0]);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Play All
          </button>
        </div>

        <div className="space-y-2">
          {folderSongs.map((song, idx) => {
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
                  <FileAudio className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {song.artist} • {song.format || 'FLAC'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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

  return (
    <div className="space-y-4 pb-28 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Storage Folders
          </h1>
          <p className="text-xs text-slate-400">
            Android MediaStore file directories
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>256 GB Internal</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {folders.map((folderPath) => {
          const count = folderMap[folderPath].length;
          const folderName = folderPath.split('/').pop() || folderPath;

          return (
            <div
              key={folderPath}
              onClick={() => setSelectedFolder(folderPath)}
              className="glass-panel p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-400/40 transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                  <Folder className="w-5 h-5 fill-amber-300/20" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {folderName}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {folderPath}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                  {count} {count === 1 ? 'song' : 'songs'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
