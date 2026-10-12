import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Home,
  Music,
  Globe,
  Disc3,
  ListMusic,
  Sliders,
  Settings,
  Smartphone,
  ShieldCheck,
  Download,
  FolderOpen,
  Search,
  Upload,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  Song,
  Album,
  Artist,
  Playlist,
  RepeatMode,
  EqualizerSettings,
  DynamicCapsuleSettings,
  AudioSettings,
  AppScreen,
} from './types/music';
import {
  INITIAL_SONGS,
  INITIAL_ALBUMS,
  INITIAL_ARTISTS,
  INITIAL_PLAYLISTS,
} from './data/sampleTracks';
import { AudioEngine } from './services/audioEngine';
import { parseLocalAudioFile, generateCoverArt } from './services/localMusicScanner';
import { smartShuffle, generateSmartPlaylists } from './services/smartAudio';
import { DynamicCapsule } from './components/DynamicCapsule';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingScreen } from './components/NowPlayingScreen';
import { EqualizerModal } from './components/EqualizerModal';
import { HomeScreen } from './components/Screens/HomeScreen';
import { SongsScreen } from './components/Screens/SongsScreen';
import { OnlineMusicScreen } from './components/Screens/OnlineMusicScreen';
import { AlbumsScreen } from './components/Screens/AlbumsScreen';
import { ArtistsScreen } from './components/Screens/ArtistsScreen';
import { FoldersScreen } from './components/Screens/FoldersScreen';
import { PlaylistsScreen } from './components/Screens/PlaylistsScreen';
import { SearchScreen } from './components/Screens/SearchScreen';
import { AudioSettingsScreen } from './components/Screens/AudioSettingsScreen';
import { CapsuleSettingsScreen } from './components/Screens/CapsuleSettingsScreen';
import { AboutPrivacyScreen } from './components/Screens/AboutPrivacyScreen';
import { SmartLibraryScreen } from './components/Screens/SmartLibraryScreen';
import { AndroidExportScreen } from './components/Screens/AndroidExportScreen';
import {
  downloadOnlineTrack,
  loadAllDownloadedSongs,
  deleteDownloadedSong,
  DownloadProgressInfo,
} from './services/downloadService';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  // Library State
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('neomusic_songs');
      return saved ? JSON.parse(saved) : INITIAL_SONGS;
    } catch {
      return INITIAL_SONGS;
    }
  });

  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);

  // Online Download State
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, DownloadProgressInfo>>({});
  const [downloadToast, setDownloadToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Load offline downloaded songs from IndexedDB on startup
  useEffect(() => {
    async function initOfflineSongs() {
      try {
        const offlineList = await loadAllDownloadedSongs();
        if (offlineList && offlineList.length > 0) {
          setSongs((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const newTracks = offlineList.filter((s) => !existingIds.has(s.id));
            const updated = prev.map((s) => {
              const match = offlineList.find((o) => o.id === s.id);
              return match ? { ...s, ...match, isDownloaded: true } : s;
            });
            return [...updated, ...newTracks];
          });
        }
      } catch (e) {
        console.warn('Failed to initialize offline cached songs:', e);
      }
    }
    initOfflineSongs();
  }, []);

  const downloadedSongs = useMemo(() => songs.filter((s) => s.isDownloaded), [songs]);
  const downloadedSongIds = useMemo(() => new Set(downloadedSongs.map((s) => s.id)), [downloadedSongs]);

  // Playlists: combine smart playlists with saved custom playlists
  const [userCustomPlaylists, setUserCustomPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('neomusic_custom_playlists');
      return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  // Dynamic merged playlists (smart + custom)
  const playlists = useMemo(() => {
    const smart = generateSmartPlaylists(songs);
    return [...smart, ...userCustomPlaylists.filter((p) => !p.isSmart)];
  }, [songs, userCustomPlaylists]);

  // Navigation & Screen
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);

  // Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    try {
      const savedId = localStorage.getItem('neomusic_last_song_id');
      if (savedId) {
        const found = songs.find((s) => s.id === savedId);
        if (found) return found;
      }
    } catch {}
    return songs[0] || null;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(songs[0]?.duration || 180);
  const [queue, setQueue] = useState<Song[]>(songs);
  const [queueIndex, setQueueIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);

  // Settings
  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>(() => {
    try {
      const saved = localStorage.getItem('neomusic_eq');
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            preset: 'Bass Boost (Deep)',
            bands: [8, 6.5, 4.5, 2, 0, 0, 0, 1, 2, 2.5],
            bassBoost: 60,
            virtualizer: 30,
            customPresets: {},
          };
    } catch {
      return {
        enabled: true,
        preset: 'Bass Boost (Deep)',
        bands: [8, 6.5, 4.5, 2, 0, 0, 0, 1, 2, 2.5],
        bassBoost: 60,
        virtualizer: 30,
        customPresets: {},
      };
    }
  });

  const [capsuleSettings, setCapsuleSettings] = useState<DynamicCapsuleSettings>({
    enabled: true,
    overlayMode: false,
    autoCollapseSeconds: 6,
    showWaveform: true,
    positionY: 20,
    allowDrag: true,
    size: 'standard',
    expanded: false,
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem('neomusic_settings');
      return saved
        ? JSON.parse(saved)
        : {
            playbackSpeed: 1.0,
            gaplessPlayback: true,
            pauseOnHeadphoneDisconnect: true,
            crossfadeDuration: 2,
            sleepTimerMinutes: null,
            sleepTimerFadeOut: true,
            resumeOnStartup: true,
            highRefreshOptimized: true,
            skipIntervalSeconds: 10,
            smartShuffle: true,
            theme: 'dark',
            accentColor: '#00f2fe',
            excludedFolders: ['/storage/emulated/0/Recordings', '/storage/emulated/0/WhatsApp/Media/Voice'],
            enableLocalDiagnostics: false,
          };
    } catch {
      return {
        playbackSpeed: 1.0,
        gaplessPlayback: true,
        pauseOnHeadphoneDisconnect: true,
        crossfadeDuration: 2,
        sleepTimerMinutes: null,
        sleepTimerFadeOut: true,
        resumeOnStartup: true,
        highRefreshOptimized: true,
        skipIntervalSeconds: 10,
        smartShuffle: true,
        theme: 'dark',
        accentColor: '#00f2fe',
        excludedFolders: ['/storage/emulated/0/Recordings', '/storage/emulated/0/WhatsApp/Media/Voice'],
        enableLocalDiagnostics: false,
      };
    }
  });

  // UI View Mode (Phone frame vs Full Screen)
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('neomusic_settings', JSON.stringify(audioSettings));
    } catch {}
  }, [audioSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('neomusic_eq', JSON.stringify(equalizerSettings));
    } catch {}
  }, [equalizerSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('neomusic_songs', JSON.stringify(songs));
    } catch {}
  }, [songs]);

  useEffect(() => {
    try {
      localStorage.setItem('neomusic_custom_playlists', JSON.stringify(userCustomPlaylists));
    } catch {}
  }, [userCustomPlaylists]);

  // Save last song ID for session resume
  useEffect(() => {
    if (currentSong && audioSettings.resumeOnStartup) {
      try {
        localStorage.setItem('neomusic_last_song_id', currentSong.id);
      } catch {}
    }
  }, [currentSong, audioSettings.resumeOnStartup]);

  // AudioEngine callbacks
  useEffect(() => {
    const engine = AudioEngine.getInstance();

    engine.onTimeUpdate = (curr, dur) => {
      setCurrentTime(curr);
      if (dur > 0 && !isNaN(dur)) setDuration(dur);
    };

    engine.onStateChange = (playing) => {
      setIsPlaying(playing);
    };

    engine.onBufferChange = (buffering) => {
      setIsBuffering(buffering);
    };

    engine.onTrackEnd = () => {
      handleNextTrack(true);
    };

    engine.applyEqualizer(equalizerSettings);
  }, []);

  useEffect(() => {
    AudioEngine.getInstance().applyEqualizer(equalizerSettings);
  }, [equalizerSettings]);

  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engine.setPlaybackRate(audioSettings.playbackSpeed);
    engine.setPauseOnDisconnect(audioSettings.pauseOnHeadphoneDisconnect);
  }, [audioSettings]);

  // Playback Control Handlers
  const handlePlaySong = async (song: Song) => {
    // Record listen history & increment playCount locally
    setSongs((prev) =>
      prev.map((s) =>
        s.id === song.id
          ? {
              ...s,
              playCount: (s.playCount || 0) + 1,
              lastPlayed: Date.now(),
            }
          : s
      )
    );

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration);

    // Update queue position
    const idx = queue.findIndex((s) => s.id === song.id);
    if (idx !== -1) {
      setQueueIndex(idx);
    } else {
      setQueue([song, ...queue]);
      setQueueIndex(0);
    }

    await AudioEngine.getInstance().loadAndPlaySong(song);
  };

  const handleTogglePlay = async () => {
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0]);
      return;
    }
    AudioEngine.getInstance().togglePlay();
  };

  const handleNextTrack = (autoEnd = false) => {
    if (repeatMode === 'one' && autoEnd && currentSong) {
      AudioEngine.getInstance().seek(0);
      AudioEngine.getInstance().play();
      return;
    }

    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'off') {
        AudioEngine.getInstance().pause();
        return;
      }
      nextIdx = 0;
    }

    setQueueIndex(nextIdx);
    handlePlaySong(queue[nextIdx]);
  };

  const handlePrevTrack = () => {
    if (currentTime > 3) {
      AudioEngine.getInstance().seek(0);
      return;
    }

    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    handlePlaySong(queue[prevIdx]);
  };

  const handleSeek = (seconds: number) => {
    AudioEngine.getInstance().seek(seconds);
    setCurrentTime(seconds);
  };

  const handleSeekRelative = (deltaSeconds: number) => {
    AudioEngine.getInstance().seekRelative(deltaSeconds);
  };

  const handleToggleFavorite = (songId: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    if (currentSong && currentSong.id === songId) {
      setCurrentSong((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleToggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    if (newShuffle) {
      const reordered = audioSettings.smartShuffle
        ? smartShuffle(queue, currentSong?.id)
        : [...queue].sort(() => Math.random() - 0.5);
      setQueue(reordered);
      if (currentSong) {
        setQueueIndex(reordered.findIndex((s) => s.id === currentSong.id));
      }
    } else {
      setQueue(songs);
      if (currentSong) {
        setQueueIndex(songs.findIndex((s) => s.id === currentSong.id));
      }
    }
  };

  const handleToggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const handleShuffleAll = () => {
    const shuffled = audioSettings.smartShuffle
      ? smartShuffle(songs)
      : [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setQueueIndex(0);
    setIsShuffle(true);
    handlePlaySong(shuffled[0]);
  };

  const handlePlayNext = (song: Song) => {
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, song);
    setQueue(newQueue);
  };

  const handleAddToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };

  const handleRemoveFromQueue = (songId: string) => {
    setQueue(queue.filter((s) => s.id !== songId));
  };

  // Local File Scanner
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newParsedSongs: Song[] = [];
    for (let i = 0; i < files.length; i++) {
      const song = await parseLocalAudioFile(files[i]);
      newParsedSongs.push(song);
    }

    if (newParsedSongs.length > 0) {
      setSongs((prev) => [...newParsedSongs, ...prev]);
      setQueue((prev) => [...newParsedSongs, ...prev]);
      handlePlaySong(newParsedSongs[0]);
    }
  };

  // Playlist handlers
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      songIds: [],
      createdAt: Date.now(),
      isCustom: true,
      coverArt: songs[0]?.artwork,
    };
    setUserCustomPlaylists([newPl, ...userCustomPlaylists]);
  };

  const handleDeletePlaylist = (id: string) => {
    setUserCustomPlaylists(userCustomPlaylists.filter((p) => p.id !== id));
    if (selectedPlaylist?.id === id) {
      setSelectedPlaylist(null);
    }
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    setUserCustomPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId && !pl.songIds.includes(songId)) {
          return { ...pl, songIds: [...pl.songIds, songId] };
        }
        return pl;
      })
    );
  };

  // Smart Library operations
  const handleRefreshArtwork = () => {
    setSongs((prev) =>
      prev.map((song) => {
        if (!song.artwork || song.artwork.length < 20) {
          return {
            ...song,
            artwork: generateCoverArt(song.title, song.artist, song.accentColor || '#00f2fe'),
            hasCustomArt: true,
          };
        }
        return song;
      })
    );
  };

  const handleClearHistory = () => {
    setSongs((prev) =>
      prev.map((song) => ({
        ...song,
        playCount: 0,
        lastPlayed: undefined,
      }))
    );
  };

  const handleDeleteSong = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    setQueue((prev) => prev.filter((s) => s.id !== songId));
    if (currentSong?.id === songId) {
      AudioEngine.getInstance().pause();
      setCurrentSong(null);
    }
  };

  // Online song download handler
  const handleDownloadSong = async (song: Song) => {
    setDownloadProgressMap((prev) => ({
      ...prev,
      [song.id]: { songId: song.id, progress: 10, status: 'downloading' },
    }));
    setDownloadToast({
      message: `Downloading "${song.title}"...`,
      type: 'info',
    });

    try {
      const { song: offlineSong } = await downloadOnlineTrack(song, (info) => {
        setDownloadProgressMap((prev) => ({
          ...prev,
          [song.id]: info,
        }));
      });

      // Update or add to library
      setSongs((prev) => {
        const exists = prev.some((s) => s.id === offlineSong.id);
        if (exists) {
          return prev.map((s) => (s.id === offlineSong.id ? offlineSong : s));
        }
        return [offlineSong, ...prev];
      });

      if (currentSong?.id === song.id) {
        setCurrentSong(offlineSong);
      }

      setDownloadToast({
        message: `Saved "${song.title}" to device storage & offline library!`,
        type: 'success',
      });
      setTimeout(() => setDownloadToast(null), 4500);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadToast({
        message: `Failed to download "${song.title}". Check connection.`,
        type: 'error',
      });
      setTimeout(() => setDownloadToast(null), 4500);
    }
  };

  const handleDeleteDownloadedSong = async (songId: string) => {
    try {
      await deleteDownloadedSong(songId);
      setSongs((prev) =>
        prev
          .map((s) => (s.id === songId ? { ...s, isDownloaded: false } : s))
          .filter(
            (s) =>
              s.isCustomFile ||
              s.id.startsWith('neo-') ||
              s.isDownloaded ||
              !s.id.startsWith('jamendo-')
          )
      );
      setDownloadToast({
        message: 'Deleted track from offline storage.',
        type: 'info',
      });
      setTimeout(() => setDownloadToast(null), 3000);
    } catch (err) {
      console.warn('Failed to delete downloaded track:', err);
    }
  };

  // Sleep timer interval with gradual volume fade-out
  useEffect(() => {
    if (audioSettings.sleepTimerMinutes === null) return;

    const interval = setInterval(() => {
      setAudioSettings((prev) => {
        if (prev.sleepTimerMinutes === null) return prev;

        // When 1 minute remains and fadeOut is enabled, start smooth volume fade
        if (prev.sleepTimerMinutes === 1 && prev.sleepTimerFadeOut) {
          AudioEngine.getInstance().fadeOutAndPause(15);
          return { ...prev, sleepTimerMinutes: null };
        }

        if (prev.sleepTimerMinutes <= 1) {
          AudioEngine.getInstance().pause();
          return { ...prev, sleepTimerMinutes: null };
        }

        return { ...prev, sleepTimerMinutes: prev.sleepTimerMinutes - 1 };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [audioSettings.sleepTimerMinutes, audioSettings.sleepTimerFadeOut]);

  const isLightMode = audioSettings.theme === 'light';
  const isGraphite = audioSettings.theme === 'graphite';

  const themeBg = isLightMode
    ? 'bg-[#f8f9fa] text-slate-800'
    : isGraphite
    ? 'bg-[#0e1117] text-slate-100'
    : 'bg-[#050608] text-slate-100';

  const frameBg = isLightMode
    ? 'bg-[#ffffff] border-slate-300'
    : isGraphite
    ? 'bg-[#12151d] border-slate-700'
    : 'bg-[#090a0d] border-zinc-800';

  return (
    <div
      className={`min-h-screen ${themeBg} flex flex-col justify-center items-center relative overflow-x-hidden`}
    >
      {/* Hidden native audio input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        multiple
        accept="audio/*,.mp3,.flac,.wav,.aac,.ogg,.m4a"
        className="hidden"
      />

      {/* Top Device Bar (Phone Frame toggle) */}
      <aside aria-label="Device view toggle" className="fixed top-2 right-3 sm:right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className={`px-3 py-1.5 rounded-full ${
            isLightMode ? 'glass-panel-light text-slate-700' : 'glass-panel text-slate-200'
          } hover:bg-white/10 active:scale-95 text-[11px] font-mono flex items-center gap-1.5 border border-white/10 shadow-sm transition-all`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isPhoneFrame ? 'Full View' : 'Phone Frame'}</span>
        </button>
      </aside>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-500 relative flex flex-col ${
          isPhoneFrame
            ? `max-w-[430px] my-6 rounded-[48px] border-[6px] ${frameBg} shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden min-h-[880px]`
            : 'max-w-3xl min-h-screen px-3 sm:px-6'
        }`}
      >
        {/* MANDATORY DYNAMIC POPUP CAPSULE (Always active & persistent on every screen) */}
        <DynamicCapsule
          currentSong={currentSong}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          currentTime={currentTime}
          duration={duration}
          settings={capsuleSettings}
          skipIntervalSeconds={audioSettings.skipIntervalSeconds}
          isDownloaded={Boolean(currentSong && downloadedSongIds.has(currentSong.id))}
          isDownloading={Boolean(currentSong && downloadProgressMap[currentSong.id]?.status === 'downloading')}
          downloadProgress={currentSong ? downloadProgressMap[currentSong.id]?.progress || 0 : 0}
          onDownloadSong={handleDownloadSong}
          onTogglePlay={handleTogglePlay}
          onNext={() => handleNextTrack(false)}
          onPrev={handlePrevTrack}
          onSeek={handleSeek}
          onSeekRelative={handleSeekRelative}
          onToggleFavorite={handleToggleFavorite}
          onOpenNowPlaying={() => setIsNowPlayingOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onToggleFloatingOverlay={() =>
            setCapsuleSettings({
              ...capsuleSettings,
              overlayMode: !capsuleSettings.overlayMode,
            })
          }
        />

        {/* Top Header bar within app */}
        <header className="flex items-center justify-between py-3 px-1 border-b border-white/5 mb-2 mt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-sm"
              style={{
                background: audioSettings.accentColor || '#06b6d4',
              }}
            >
              <Disc3 className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                NeoMusic
              </span>
              <span className="text-[11px] font-mono text-slate-400 ml-2 font-medium">
                Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentScreen('online')}
              title="Online Music Streaming"
              aria-label="Online Music Streaming"
              className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold ${
                currentScreen === 'online'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Online</span>
            </button>

            <button
              onClick={() => setCurrentScreen('search')}
              aria-label="Search"
              className={`p-2 rounded-xl transition-all ${
                currentScreen === 'search'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentScreen('smart-library')}
              title="Smart Library Tools"
              aria-label="Smart Library Tools"
              className={`p-2 rounded-xl transition-all ${
                currentScreen === 'smart-library'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:bg-white/10'
              }`}
            >
              <Wand2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsEqualizerOpen(true)}
              aria-label="Equalizer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentScreen('android-export')}
              title="Android Studio Source Code & Cloud Build Export"
              aria-label="Android Studio Source Code and Cloud Build Export"
              className={`p-2 rounded-xl transition-all ${
                currentScreen === 'android-export'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-emerald-400 hover:bg-white/10'
              }`}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Screen Routing */}
        <main className="flex-1">
          {currentScreen === 'home' && (
            <HomeScreen
              songs={songs}
              albums={albums}
              playlists={playlists}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onShuffleAll={handleShuffleAll}
              onNavigate={setCurrentScreen}
              onOpenEqualizer={() => setIsEqualizerOpen(true)}
              onImportClick={() => fileInputRef.current?.click()}
              onSelectAlbum={(album) => {
                setSelectedAlbum(album);
                setCurrentScreen('albums');
              }}
              onSelectPlaylist={(pl) => {
                setSelectedPlaylist(pl);
                setCurrentScreen('playlists');
              }}
            />
          )}

          {currentScreen === 'songs' && (
            <SongsScreen
              songs={songs}
              playlists={playlists}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onPlayNext={handlePlayNext}
              onAddToQueue={handleAddToQueue}
              onToggleFavorite={handleToggleFavorite}
              onShuffleAll={handleShuffleAll}
              onImportClick={() => fileInputRef.current?.click()}
              onAddToPlaylist={handleAddToPlaylist}
              onDeleteDownloadedSong={handleDeleteDownloadedSong}
            />
          )}

          {currentScreen === 'online' && (
            <OnlineMusicScreen
              currentSong={currentSong}
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              playlists={playlists}
              downloadedSongIds={downloadedSongIds}
              downloadProgressMap={downloadProgressMap}
              downloadedSongs={downloadedSongs}
              onPlaySong={handlePlaySong}
              onPlayNext={handlePlayNext}
              onAddToQueue={handleAddToQueue}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onDownloadSong={handleDownloadSong}
              onDeleteDownloadedSong={handleDeleteDownloadedSong}
            />
          )}

          {currentScreen === 'albums' && (
            <AlbumsScreen
              albums={albums}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={setSelectedAlbum}
            />
          )}

          {currentScreen === 'artists' && (
            <ArtistsScreen
              artists={artists}
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
            />
          )}

          {currentScreen === 'folders' && (
            <FoldersScreen
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
            />
          )}

          {currentScreen === 'playlists' && (
            <PlaylistsScreen
              playlists={playlists}
              songs={songs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              selectedPlaylist={selectedPlaylist}
              onSelectPlaylist={setSelectedPlaylist}
            />
          )}

          {currentScreen === 'search' && (
            <SearchScreen
              songs={songs}
              albums={albums}
              artists={artists}
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onSelectAlbum={(album) => {
                setSelectedAlbum(album);
                setCurrentScreen('albums');
              }}
            />
          )}

          {currentScreen === 'smart-library' && (
            <SmartLibraryScreen
              songs={songs}
              excludedFolders={audioSettings.excludedFolders}
              enableDiagnostics={audioSettings.enableLocalDiagnostics}
              onUpdateExcludedFolders={(folders) =>
                setAudioSettings({ ...audioSettings, excludedFolders: folders })
              }
              onToggleDiagnostics={(enabled) =>
                setAudioSettings({ ...audioSettings, enableLocalDiagnostics: enabled })
              }
              onRefreshArtwork={handleRefreshArtwork}
              onClearHistory={handleClearHistory}
              onDeleteSong={handleDeleteSong}
            />
          )}

          {currentScreen === 'audio-settings' && (
            <AudioSettingsScreen
              settings={audioSettings}
              onUpdateSettings={setAudioSettings}
            />
          )}

          {currentScreen === 'capsule-settings' && (
            <CapsuleSettingsScreen
              settings={capsuleSettings}
              onUpdateSettings={setCapsuleSettings}
            />
          )}

          {currentScreen === 'about-privacy' && <AboutPrivacyScreen />}

          {currentScreen === 'android-export' && <AndroidExportScreen />}
        </main>

        {/* Mini Player Dock */}
        {!isNowPlayingOpen && currentSong && (
          <MiniPlayer
            currentSong={currentSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onNext={() => handleNextTrack(false)}
            onToggleFavorite={handleToggleFavorite}
            onOpenNowPlaying={() => setIsNowPlayingOpen(true)}
          />
        )}

        {/* Bottom Liquid Glass Navigation Bar */}
        <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-2 pointer-events-none">
          <div
            className={`pointer-events-auto max-w-md mx-auto rounded-3xl ${
              isLightMode ? 'glass-panel-light' : 'glass-panel'
            } p-2 flex items-center justify-around shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/15`}
          >
            <button
              onClick={() => setCurrentScreen('home')}
              aria-label="Home"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
                currentScreen === 'home'
                  ? 'text-cyan-400 font-bold bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => setCurrentScreen('songs')}
              aria-label="Songs"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
                currentScreen === 'songs'
                  ? 'text-cyan-400 font-bold bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-5 h-5" />
              <span className="text-[10px]">Library</span>
            </button>

            {/* Online Streaming Tab */}
            <button
              onClick={() => setCurrentScreen('online')}
              aria-label="Online Streaming"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
                currentScreen === 'online'
                  ? 'text-purple-400 font-bold bg-purple-500/15'
                  : 'text-purple-300/80 hover:text-white'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-[10px]">Online</span>
            </button>

            <button
              onClick={() => setCurrentScreen('playlists')}
              aria-label="Playlists"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
                currentScreen === 'playlists'
                  ? 'text-cyan-400 font-bold bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-5 h-5" />
              <span className="text-[10px]">Mixes</span>
            </button>

            <button
              onClick={() => setCurrentScreen('audio-settings')}
              aria-label="Settings"
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
                ['audio-settings', 'capsule-settings', 'about-privacy'].includes(
                  currentScreen
                )
                  ? 'text-cyan-400 font-bold bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px]">Settings</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Download Status Toast Notification */}
      {downloadToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 z-[9999] px-4 py-2.5 rounded-2xl glass-panel shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300 max-w-sm border ${
            downloadToast.type === 'success'
              ? 'border-emerald-400/50 text-emerald-200 bg-emerald-950/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : downloadToast.type === 'error'
              ? 'border-rose-400/50 text-rose-200 bg-rose-950/80'
              : 'border-cyan-400/50 text-cyan-200 bg-slate-900/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          }`}
        >
          {downloadToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : downloadToast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          )}
          <span>{downloadToast.message}</span>
        </div>
      )}

      {/* Fullscreen Now Playing Overlay */}
      {isNowPlayingOpen && (
        <NowPlayingScreen
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          queue={queue}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          playbackSpeed={audioSettings.playbackSpeed}
          sleepTimerMinutes={audioSettings.sleepTimerMinutes}
          skipIntervalSeconds={audioSettings.skipIntervalSeconds}
          isDownloaded={Boolean(currentSong && downloadedSongIds.has(currentSong.id))}
          isDownloading={Boolean(currentSong && downloadProgressMap[currentSong.id]?.status === 'downloading')}
          downloadProgress={currentSong ? downloadProgressMap[currentSong.id]?.progress || 0 : 0}
          onDownloadSong={handleDownloadSong}
          onClose={() => setIsNowPlayingOpen(false)}
          onTogglePlay={handleTogglePlay}
          onNext={() => handleNextTrack(false)}
          onPrev={handlePrevTrack}
          onSeek={handleSeek}
          onSeekRelative={handleSeekRelative}
          onToggleFavorite={handleToggleFavorite}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onSetPlaybackSpeed={(speed) =>
            setAudioSettings({ ...audioSettings, playbackSpeed: speed })
          }
          onSetSleepTimer={(mins) =>
            setAudioSettings({ ...audioSettings, sleepTimerMinutes: mins })
          }
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onPlaySongFromQueue={handlePlaySong}
          onRemoveFromQueue={handleRemoveFromQueue}
        />
      )}

      {/* Equalizer Modal */}
      {isEqualizerOpen && (
        <EqualizerModal
          settings={equalizerSettings}
          onUpdateSettings={setEqualizerSettings}
          onClose={() => setIsEqualizerOpen(false)}
        />
      )}
    </div>
  );
}
