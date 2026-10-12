import { Song, Album, Artist, Playlist } from '../types/music';

// Exquisite gradient SVG artworks representing Liquid Glass aesthetic
export const ARTWORK_SVGS = {
  cyberNeon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <radialGradient id="g1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#00f2fe" />
          <stop offset="50%" stop-color="#4facfe" />
          <stop offset="100%" stop-color="#000826" />
        </radialGradient>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff007f" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#7928ca" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#g1)" />
      <circle cx="280" cy="220" r="160" fill="url(#g2)" />
      <circle cx="180" cy="340" r="110" fill="#00f2fe" opacity="0.35" />
      <path d="M 120 250 Q 250 120 380 250 T 420 380" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none"/>
      <circle cx="250" cy="250" r="60" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
      <circle cx="250" cy="250" r="12" fill="#ffffff" />
    </svg>
  `)}`,

  liquidGlass: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <radialGradient id="rg" cx="70%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#a8edea" />
          <stop offset="40%" stop-color="#fed6e3" />
          <stop offset="100%" stop-color="#141829" />
        </radialGradient>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38f9d7" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#43e97b" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#rg)" />
      <rect x="80" y="80" width="340" height="340" rx="60" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <circle cx="250" cy="250" r="90" fill="url(#metal)" opacity="0.6"/>
      <circle cx="320" cy="180" r="45" fill="#ffffff" opacity="0.5"/>
    </svg>
  `)}`,

  midnightPulse: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff416c" />
          <stop offset="60%" stop-color="#ff4b2b" />
          <stop offset="100%" stop-color="#1a0b12" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#bg)" />
      <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
      <circle cx="250" cy="250" r="90" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-dasharray="20 15"/>
      <circle cx="250" cy="250" r="30" fill="#ffffff" opacity="0.9"/>
    </svg>
  `)}`,

  quantumHorizon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <radialGradient id="qg" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stop-color="#8a2387" />
          <stop offset="40%" stop-color="#e94057" />
          <stop offset="100%" stop-color="#f27121" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="#070913" />
      <circle cx="250" cy="250" r="180" fill="url(#qg)" />
      <path d="M 50 360 L 450 360" stroke="#00f2fe" stroke-width="3" opacity="0.8"/>
      <path d="M 80 380 L 420 380" stroke="#00f2fe" stroke-width="2" opacity="0.5"/>
      <path d="M 120 400 L 380 400" stroke="#00f2fe" stroke-width="1.5" opacity="0.3"/>
    </svg>
  `)}`,

  auroraVelvet: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#11998e" />
          <stop offset="50%" stop-color="#38ef7d" />
          <stop offset="100%" stop-color="#0a192f" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#aurora)" />
      <circle cx="200" cy="220" r="100" fill="rgba(255,255,255,0.2)" />
      <circle cx="320" cy="270" r="80" fill="rgba(255,255,255,0.3)" />
    </svg>
  `)}`,
};

export const INITIAL_SONGS: Song[] = [
  {
    id: 'neo-1',
    title: 'Cyber Neon Horizon',
    artist: 'Neo Soundworks',
    album: 'Liquid Spectrum',
    duration: 184,
    url: '',
    artwork: ARTWORK_SVGS.cyberNeon,
    accentColor: '#00f2fe',
    genre: 'Synthwave',
    year: 2026,
    format: 'FLAC',
    bitrate: '1411 kbps',
    sampleRate: '48 kHz / 24-bit',
    isFavorite: true,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 2,
    playCount: 42,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 12,
    folder: '/storage/emulated/0/Music/Lossless',
    tempoBpm: 110,
    hasCustomArt: true,
    lyrics: [
      '[00:00.00] Liquid Audio Engine Initialized',
      '[00:12.00] Soft neon reflections and clean transients',
      '[00:24.00] Dynamic floating capsule hovering in view',
      '[00:36.00] Deep sub-bass driving the acoustic landscape',
      '[00:48.00] Crystal clear playback with zero distortion',
      '[01:00.00] Seamless local background execution',
      '[01:15.00] Pure offline listening, 100% ad-free sound',
      '[01:32.00] Harmonies drifting peacefully through the night',
    ],
  },
  {
    id: 'neo-2',
    title: 'Liquid Glass Nocturne',
    artist: 'Kaelen Vance',
    album: 'Prism Reflections',
    duration: 195,
    url: '',
    artwork: ARTWORK_SVGS.liquidGlass,
    accentColor: '#38f9d7',
    genre: 'Chillout',
    year: 2026,
    format: 'WAV',
    bitrate: '1536 kbps',
    sampleRate: '48 kHz / 24-bit',
    isFavorite: true,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 5,
    playCount: 31,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 36,
    folder: '/storage/emulated/0/Music/Acoustic',
    tempoBpm: 82,
    hasCustomArt: true,
    lyrics: [
      '[00:00.00] Frosted translucence settles in the calm',
      '[00:15.00] Soft acoustic chimes echoing through quiet spaces',
      '[00:30.00] Gentle stereo widening wraps around you',
      '[00:45.00] Ambient warmth in 10-band precision',
      '[01:05.00] A peaceful state of uninterrupted flow',
    ],
  },
  {
    id: 'neo-3',
    title: 'Midnight Velocity Pulse',
    artist: 'Horizon Drift',
    album: 'Liquid Spectrum',
    duration: 172,
    url: '',
    artwork: ARTWORK_SVGS.midnightPulse,
    accentColor: '#ff4b2b',
    genre: 'Lo-Fi Beats',
    year: 2026,
    format: 'FLAC',
    bitrate: '980 kbps',
    sampleRate: '44.1 kHz / 16-bit',
    isFavorite: false,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 1,
    playCount: 19,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 8,
    folder: '/storage/emulated/0/Music/Lossless',
    tempoBpm: 96,
    hasCustomArt: true,
    lyrics: [
      '[00:00.00] Midnight in the city that never powers down',
      '[00:18.00] Subwoofers humming behind the glass panel',
      '[00:35.00] Analog warmth meets digital crispness',
      '[00:52.00] Drifting rhythm on an endless highway',
    ],
  },
  {
    id: 'neo-4',
    title: 'Quantum Frequencies',
    artist: 'Aether Wave',
    album: 'Quantum Frequencies',
    duration: 210,
    url: '',
    artwork: ARTWORK_SVGS.quantumHorizon,
    accentColor: '#e94057',
    genre: 'Progressive Electro',
    year: 2025,
    format: 'MP3',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    isFavorite: true,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
    playCount: 56,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 4,
    folder: '/storage/emulated/0/Downloads',
    tempoBpm: 124,
    hasCustomArt: true,
    lyrics: [
      '[00:00.00] High frame rate synchronization',
      '[00:20.00] Frequency response tuned to perfection',
      '[00:40.00] Dynamic capsule pulsing to the beat',
      '[01:10.00] Uncompromised energy without ads or trackers',
    ],
  },
  {
    id: 'neo-5',
    title: 'Aurora Velvet',
    artist: 'Lumina',
    album: 'Ethereal Nights',
    duration: 165,
    url: '',
    artwork: ARTWORK_SVGS.auroraVelvet,
    accentColor: '#38ef7d',
    genre: 'Ambient',
    year: 2026,
    format: 'AAC',
    bitrate: '256 kbps',
    sampleRate: '48 kHz',
    isFavorite: false,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 12,
    playCount: 14,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 48,
    folder: '/storage/emulated/0/Music/Ambient',
    tempoBpm: 75,
    hasCustomArt: true,
    lyrics: [
      '[00:00.00] Northern sky painted in polar greens',
      '[00:22.00] Velvet pads floating through zero gravity',
      '[00:48.00] Breathing in the serenity of quiet night',
    ],
  },
];

export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'album-1',
    title: 'Liquid Spectrum',
    artist: 'Various Artists',
    artwork: ARTWORK_SVGS.cyberNeon,
    accentColor: '#00f2fe',
    year: 2026,
    trackCount: 2,
    songs: [INITIAL_SONGS[0], INITIAL_SONGS[2]],
  },
  {
    id: 'album-2',
    title: 'Prism Reflections',
    artist: 'Kaelen Vance',
    artwork: ARTWORK_SVGS.liquidGlass,
    accentColor: '#38f9d7',
    year: 2026,
    trackCount: 1,
    songs: [INITIAL_SONGS[1]],
  },
  {
    id: 'album-3',
    title: 'Quantum Frequencies',
    artist: 'Aether Wave',
    artwork: ARTWORK_SVGS.quantumHorizon,
    accentColor: '#e94057',
    year: 2025,
    trackCount: 1,
    songs: [INITIAL_SONGS[3]],
  },
  {
    id: 'album-4',
    title: 'Ethereal Nights',
    artist: 'Lumina',
    artwork: ARTWORK_SVGS.auroraVelvet,
    accentColor: '#38ef7d',
    year: 2026,
    trackCount: 1,
    songs: [INITIAL_SONGS[4]],
  },
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    name: 'Neo Soundworks',
    artwork: ARTWORK_SVGS.cyberNeon,
    accentColor: '#00f2fe',
    albumCount: 1,
    trackCount: 1,
  },
  {
    id: 'artist-2',
    name: 'Kaelen Vance',
    artwork: ARTWORK_SVGS.liquidGlass,
    accentColor: '#38f9d7',
    albumCount: 1,
    trackCount: 1,
  },
  {
    id: 'artist-3',
    name: 'Horizon Drift',
    artwork: ARTWORK_SVGS.midnightPulse,
    accentColor: '#ff4b2b',
    albumCount: 1,
    trackCount: 1,
  },
  {
    id: 'artist-4',
    name: 'Aether Wave',
    artwork: ARTWORK_SVGS.quantumHorizon,
    accentColor: '#e94057',
    albumCount: 1,
    trackCount: 1,
  },
  {
    id: 'artist-5',
    name: 'Lumina',
    artwork: ARTWORK_SVGS.auroraVelvet,
    accentColor: '#38ef7d',
    albumCount: 1,
    trackCount: 1,
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-favs',
    name: 'Favorites',
    description: 'Tracks marked as your favorite listening gems',
    songIds: ['neo-1', 'neo-2', 'neo-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    isCustom: false,
    coverArt: ARTWORK_SVGS.cyberNeon,
  },
  {
    id: 'playlist-cyber',
    name: 'Cyber Drive',
    description: 'Energetic electronic and synthwave beats',
    songIds: ['neo-1', 'neo-3', 'neo-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    isCustom: true,
    coverArt: ARTWORK_SVGS.quantumHorizon,
  },
  {
    id: 'playlist-chill',
    name: 'Midnight Chillout',
    description: 'Smooth, relaxing ambient pads and velvet chill',
    songIds: ['neo-2', 'neo-5'],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    isCustom: true,
    coverArt: ARTWORK_SVGS.liquidGlass,
  },
];
