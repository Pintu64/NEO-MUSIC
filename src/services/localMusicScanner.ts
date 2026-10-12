import { Song } from '../types/music';

const ACCENT_COLORS = [
  '#00f2fe',
  '#38f9d7',
  '#ff4b2b',
  '#e94057',
  '#38ef7d',
  '#f107a3',
  '#7928ca',
  '#ff9900',
];

/**
 * Generates an SVG artwork based on song title and artist
 */
export function generateCoverArt(title: string, artist: string, color: string): string {
  const initials = `${title.charAt(0)}${artist.charAt(0)}`.toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <radialGradient id="g" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="60%" stop-color="#141829" />
          <stop offset="100%" stop-color="#05070d" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(#g)" />
      <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
      <circle cx="250" cy="250" r="110" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <circle cx="250" cy="250" r="45" fill="${color}" opacity="0.3"/>
      <text x="250" y="270" font-family="sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="4">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Parses user-selected local audio file
 */
export async function parseLocalAudioFile(file: File): Promise<Song> {
  const url = URL.createObjectURL(file);
  const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

  // Clean filename
  const cleanName = file.name.replace(/\.[^/.]+$/, '');
  let title = cleanName;
  let artist = 'Local Artist';
  let album = 'Local Library';

  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Determine format
  const extension = file.name.split('.').pop()?.toUpperCase() || 'MP3';
  const format = (['FLAC', 'WAV', 'AAC', 'OGG', 'MP3'].includes(extension) ? extension : 'MP3') as Song['format'];

  // Read actual duration using audio tag
  const duration = await new Promise<number>((resolve) => {
    const tempAudio = new Audio(url);
    tempAudio.addEventListener('loadedmetadata', () => {
      resolve(Math.round(tempAudio.duration) || 180);
    });
    tempAudio.addEventListener('error', () => {
      resolve(180);
    });
    // Fallback timeout
    setTimeout(() => resolve(180), 2000);
  });

  const artwork = generateCoverArt(title, artist, color);

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    artist,
    album,
    duration,
    url,
    artwork,
    accentColor: color,
    genre: 'Local Audio',
    year: new Date().getFullYear(),
    format,
    bitrate: file.size > 20000000 ? '1411 kbps' : '320 kbps',
    sampleRate: file.size > 20000000 ? '96 kHz' : '44.1 kHz',
    isFavorite: false,
    dateAdded: Date.now(),
    playCount: 0,
    folder: (file as { webkitRelativePath?: string }).webkitRelativePath ? (file as { webkitRelativePath?: string }).webkitRelativePath!.split('/')[0] : '/storage/emulated/0/Music',
    isCustomFile: true,
  };
}
