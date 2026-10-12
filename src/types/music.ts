export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string;
  artwork: string;
  accentColor: string;
  genre?: string;
  year?: number;
  format?: 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG';
  bitrate?: string;
  sampleRate?: string;
  isFavorite?: boolean;
  dateAdded?: number;
  playCount?: number;
  lastPlayed?: number;
  lyrics?: string[];
  folder?: string;
  isCustomFile?: boolean;
  fileSize?: number;
  hasCustomArt?: boolean;
  tempoBpm?: number;
  // Online streaming fields
  isOnline?: boolean;
  source?: 'local' | 'jamendo' | 'archive' | 'itunes' | 'procedural';
  sourceLabel?: string;
  license?: string;
  isStreamPreview?: boolean; // e.g. 30s preview clip
  sourceWebUrl?: string;
  streamStatus?: 'idle' | 'loading' | 'buffering' | 'ready' | 'error';
  // Offline & Download fields
  isDownloaded?: boolean;
  downloadedAt?: number;
  downloadSize?: number;
  downloadProgress?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  accentColor: string;
  year?: number;
  trackCount: number;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  accentColor: string;
  albumCount: number;
  trackCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  isCustom?: boolean;
  isSmart?: boolean;
  smartCategory?: 'favorites' | 'focus' | 'chill' | 'workout' | 'sleep' | 'recent';
  coverArt?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bands: number[]; // 10 bands gains in dB (-12 to +12)
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100
  customPresets: Record<string, number[]>;
}

export interface DynamicCapsuleSettings {
  enabled: boolean;
  overlayMode: boolean; // floating draggable overlay over screen
  autoCollapseSeconds: number;
  showWaveform: boolean;
  positionY: number; // offset from top
  allowDrag: boolean;
  size: 'compact' | 'standard' | 'large';
  expanded: boolean;
}

export interface AudioSettings {
  playbackSpeed: number; // 0.5 to 2.0
  gaplessPlayback: boolean;
  pauseOnHeadphoneDisconnect: boolean;
  crossfadeDuration: number; // 0 to 8 seconds
  sleepTimerMinutes: number | null; // null = off
  sleepTimerFadeOut: boolean; // gradual volume fade-out before stopping
  resumeOnStartup: boolean;
  highRefreshOptimized: boolean; // High refresh rate frame animations
  skipIntervalSeconds: number; // 5, 10, 15, 30 seconds
  smartShuffle: boolean; // Weighted listening history & artist spread
  theme: 'dark' | 'graphite' | 'light';
  accentColor: string; // Hex color for user customized theme
  excludedFolders: string[]; // Folders to hide from music library
  enableLocalDiagnostics: boolean; // Diagnostic logging strictly stored locally
}

export interface DuplicateGroup {
  key: string;
  songs: Song[];
  reason: string;
}

export type OnlineSourceFilter = 'all' | 'jamendo' | 'archive' | 'itunes';

export type AppScreen =
  | 'home'
  | 'songs'
  | 'online'
  | 'albums'
  | 'artists'
  | 'folders'
  | 'playlists'
  | 'now-playing'
  | 'search'
  | 'equalizer'
  | 'audio-settings'
  | 'capsule-settings'
  | 'about-privacy'
  | 'smart-library'
  | 'android-export';
