import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Radio,
  Play,
  Pause,
  PlusCircle,
  ListPlus,
  Heart,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Music,
  ShieldCheck,
  Disc3,
  Clock,
  MoreVertical,
  Download,
  CheckCircle2,
  Trash2,
  FolderDown,
  HardDrive,
  FileAudio,
} from 'lucide-react';
import { Song, Playlist, OnlineSourceFilter } from '../../types/music';
import { searchOnlineMusic, getTrendingOnlineTracks } from '../../services/onlineMusicService';
import { DownloadProgressInfo } from '../../services/downloadService';

interface OnlineMusicScreenProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playlists: Playlist[];
  downloadedSongIds?: Set<string>;
  downloadProgressMap?: Record<string, DownloadProgressInfo>;
  downloadedSongs?: Song[];
  onPlaySong: (song: Song) => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onDownloadSong?: (song: Song) => void;
  onDeleteDownloadedSong?: (songId: string) => void;
}

export const OnlineMusicScreen: React.FC<OnlineMusicScreenProps> = ({
  currentSong,
  isPlaying,
  isBuffering,
  playlists,
  downloadedSongIds = new Set(),
  downloadProgressMap = {},
  downloadedSongs = [],
  onPlaySong,
  onPlayNext,
  onAddToQueue,
  onToggleFavorite,
  onAddToPlaylist,
  onDownloadSong,
  onDeleteDownloadedSong,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'downloads'>('stream');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<OnlineSourceFilter>('all');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(['chillout', 'synthwave', 'piano', 'rock']);
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);

  // Trending online categories
  const [trending, setTrending] = useState<{
    chillout: Song[];
    electronic: Song[];
    classical: Song[];
  }>({ chillout: [], electronic: [], classical: [] });
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Network connection state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial trending tracks
  useEffect(() => {
    let isMounted = true;
    async function loadTrending() {
      setIsLoadingTrending(true);
      try {
        const data = await getTrendingOnlineTracks();
        if (isMounted) setTrending(data);
      } catch (e) {
        console.warn(e);
      } finally {
        if (isMounted) setIsLoadingTrending(false);
      }
    }
    loadTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    // Add to recent
    if (!recentSearches.includes(queryToSearch.trim())) {
      setRecentSearches([queryToSearch.trim(), ...recentSearches.slice(0, 5)]);
    }

    try {
      const results = await searchOnlineMusic(queryToSearch.trim(), sourceFilter);
      if (results.length === 0) {
        setSearchError('No authorized streaming tracks found. Try a different artist, song, or filter.');
      }
      setSearchResults(results);
    } catch (err) {
      setSearchError('Network error while querying online audio providers. Check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '3.8 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const totalDownloadedBytes = downloadedSongs.reduce((acc, s) => acc + (s.downloadSize || s.fileSize || 3800000), 0);

  // Render download action button helper
  const renderDownloadButton = (song: Song, isCompact = false) => {
    const isDownloaded = downloadedSongIds.has(song.id) || song.isDownloaded;
    const progressInfo = downloadProgressMap[song.id];
    const isDownloading = progressInfo?.status === 'downloading';

    if (isDownloading) {
      return (
        <div
          title={`Downloading: ${progressInfo.progress}%`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono shrink-0 animate-pulse"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
          <span className="text-[10px]">{progressInfo.progress}%</span>
        </div>
      );
    }

    if (isDownloaded) {
      return (
        <div
          title="Downloaded to offline library & device"
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {!isCompact && <span className="text-[10px]">Saved</span>}
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onDownloadSong) onDownloadSong(song);
        }}
        title="Download .MP3 to Offline Library & Device"
        aria-label="Download song"
        className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 active:scale-95 transition-all flex items-center gap-1 shrink-0 group"
      >
        <Download className="w-4 h-4 group-hover:text-purple-300 group-hover:translate-y-0.5 transition-transform" />
        {!isCompact && <span className="text-[10px] font-medium hidden sm:inline">Download</span>}
      </button>
    );
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      {/* Header with Connectivity Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Online Music &amp; Downloads
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Authorized Audio APIs</span>
            <span aria-hidden="true">·</span>
            <span>Creative Commons &amp; Public Domain</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-mono">
              <WifiOff className="w-3.5 h-3.5" />
              <span>No Connection</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Switcher: Stream & Search vs Offline Downloads */}
      <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'stream'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Stream &amp; Search</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'downloads'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderDown className="w-4 h-4" />
          <span>Offline Downloads ({downloadedSongs.length})</span>
        </button>
      </div>

      {/* TAB 1: STREAM & SEARCH */}
      {activeTab === 'stream' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Online Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search online songs by title, artist, or album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/20 rounded-2xl pl-11 pr-24 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 shadow-xl transition-all"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 active:scale-95 text-white font-bold text-xs transition-all disabled:opacity-40"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Source Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { key: 'all', label: 'All Sources' },
              { key: 'jamendo', label: 'Jamendo (Full CC MP3s)' },
              { key: 'itunes', label: 'Apple Music Previews' },
              { key: 'archive', label: 'Internet Archive' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setSourceFilter(f.key as OnlineSourceFilter);
                  if (searchQuery.trim()) handleSearch(searchQuery);
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  sourceFilter === f.key
                    ? 'bg-purple-500 text-white font-bold shadow'
                    : 'glass-panel text-slate-300 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && searchResults.length === 0 && !isSearching && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] text-slate-400 shrink-0">Popular queries:</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white whitespace-nowrap"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* SEARCH LOADING */}
          {isSearching && (
            <div className="glass-panel p-8 rounded-3xl text-center border border-white/15 space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
              <p className="text-sm font-bold text-white">Searching authorized online audio streams...</p>
              <p className="text-xs text-slate-400">Querying Jamendo, Apple Music Previews, and Internet Archive</p>
            </div>
          )}

          {searchError && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* SEARCH RESULTS */}
          {searchResults.length > 0 && !isSearching && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Search Results ({searchResults.length})
                  </h3>
                  {onDownloadSong && (
                    <button
                      onClick={() => {
                        searchResults.forEach((s) => {
                          if (!downloadedSongIds.has(s.id)) onDownloadSong(s);
                        });
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 flex items-center gap-1 font-mono transition-all"
                    >
                      <Download className="w-3 h-3" />
                      Download All
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear Results
                </button>
              </div>

              <div className="space-y-2">
                {searchResults.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isSongPlaying = isCurrent && isPlaying;
                  const isMenuOpen = activeMenuSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song)}
                      className={`glass-panel p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-purple-400/50 relative ${
                        isCurrent ? 'border-purple-500/50 bg-purple-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow">
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              {isBuffering ? (
                                <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />
                              ) : isPlaying ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                              ) : (
                                <Play className="w-4 h-4 fill-white" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                              {song.title}
                            </p>
                            {song.isStreamPreview && (
                              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                                Preview
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {song.artist} • {song.album}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span className="text-purple-300">{song.sourceLabel}</span>
                            <span>•</span>
                            <span>{formatDuration(song.duration)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* DOWNLOAD BUTTON */}
                        {renderDownloadButton(song)}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(song.id);
                          }}
                          aria-label="Toggle favorite"
                          className={`p-2 rounded-full transition-all ${
                            song.isFavorite ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={song.isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlaySong(song);
                          }}
                          aria-label="Play song"
                          className="w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold flex items-center justify-center transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                        >
                          {isSongPlaying ? (
                            <Pause className="w-4 h-4 fill-slate-950" />
                          ) : (
                            <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
                          )}
                        </button>

                        {/* Menu options */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuSongId(isMenuOpen ? null : song.id);
                            }}
                            aria-label="More options"
                            className="p-1.5 rounded-full text-slate-400 hover:text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-8 sm:bottom-auto sm:top-8 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-2xl z-30 flex flex-col gap-1 text-xs animate-in fade-in"
                            >
                              <button
                                onClick={() => {
                                  if (onDownloadSong) onDownloadSong(song);
                                  setActiveMenuSongId(null);
                                }}
                                className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-left text-slate-200 flex items-center gap-2"
                              >
                                <Download className="w-3.5 h-3.5 text-purple-400" />
                                Download .MP3
                              </button>
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
                })}
              </div>
            </div>
          )}

          {/* FEATURED / TRENDING ONLINE CHANNELS */}
          {searchResults.length === 0 && !isSearching && (
            <div className="space-y-6">
              {/* Chillout Stream */}
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Chillout &amp; Ambient (Full CC MP3 Streams)
                    </h3>
                  </div>
                </div>

                {isLoadingTrending ? (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    Loading featured streams...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {trending.chillout.slice(0, 4).map((song) => (
                      <div
                        key={song.id}
                        onClick={() => onPlaySong(song)}
                        className="glass-panel p-3 rounded-2xl cursor-pointer hover:border-cyan-400/40 transition-all group flex flex-col justify-between"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-white/10">
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlaySong(song);
                            }}
                            aria-label="Play song"
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate">{song.title}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-300">CC MP3</span>
                          {renderDownloadButton(song, true)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Electronic Stream */}
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Electronic &amp; Synth Beats
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {trending.electronic.slice(0, 4).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song)}
                      className="glass-panel p-3 rounded-2xl cursor-pointer hover:border-purple-400/40 transition-all group flex flex-col justify-between"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-white/10">
                        <img
                          src={song.artwork}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlaySong(song);
                          }}
                          aria-label="Play song"
                          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-purple-500 text-slate-950 font-bold flex items-center justify-center shadow"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate">{song.title}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-300">Free MP3</span>
                        {renderDownloadButton(song, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Legal and Licensing Policy Notice */}
              <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-black/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Offline Download &amp; Licensing</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Downloaded songs are saved as genuine MP3 files to your device storage (Downloads folder) and securely cached in NeoMusic offline storage. All downloaded songs work 100% offline with zero data consumption.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOWNLOADED SONGS VIEW */}
      {activeTab === 'downloads' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Downloads Summary Card */}
          <div className="glass-panel p-4 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-blue-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Offline Music Cache</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {downloadedSongs.length} tracks • {formatBytes(totalDownloadedBytes)} stored locally
                </p>
              </div>
            </div>

            {downloadedSongs.length > 0 && (
              <button
                onClick={() => onPlaySong(downloadedSongs[0])}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Play All
              </button>
            )}
          </div>

          {downloadedSongs.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center border border-white/10 space-y-3">
              <FolderDown className="w-10 h-10 text-cyan-400/60 mx-auto" />
              <h4 className="text-base font-bold text-white">No downloaded songs yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Search or browse tracks in the Stream tab, then tap the Download button to save them for offline playback.
              </p>
              <button
                onClick={() => setActiveTab('stream')}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow"
              >
                Browse Online Music
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {downloadedSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isSongPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => onPlaySong(song)}
                    className={`glass-panel p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-cyan-400/40 group ${
                      isCurrent ? 'border-cyan-400/50 bg-cyan-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={song.artwork}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Offline MP3
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {song.artist} • {song.album}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{formatDuration(song.duration)}</span>
                          <span>•</span>
                          <span>{formatBytes(song.downloadSize || song.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySong(song);
                        }}
                        aria-label="Play downloaded song"
                        className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow"
                      >
                        {isSongPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
                        )}
                      </button>

                      {onDeleteDownloadedSong && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDownloadedSong(song.id);
                          }}
                          title="Delete from offline storage"
                          aria-label="Delete downloaded song"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
