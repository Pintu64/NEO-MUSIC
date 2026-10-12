import { Song, OnlineSourceFilter } from '../types/music';

// Verified, public demo client ID for Jamendo Music API (Creative Commons music)
const JAMENDO_CLIENT_ID = '56d30c95';

const ACCENT_COLORS = [
  '#00f2fe',
  '#38f9d7',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#3b82f6',
  '#10b981',
];

/**
 * Searches Jamendo API for Creative Commons tracks with full, legal streaming audio
 */
export async function searchJamendo(query: string, limit = 15): Promise<Song[]> {
  try {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&namesearch=${encodeURIComponent(
      query
    )}&include=musicinfo&audioformat=mp32`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results
      .filter((item: { audio?: string }) => Boolean(item.audio))
      .map((item: {
        id: string;
        name: string;
        artist_name: string;
        album_name?: string;
        duration: number;
        audio: string;
        image?: string;
        shareurl?: string;
        license_ccurl?: string;
        musicinfo?: { tags?: { genres?: string[] } };
      }, idx: number) => ({
        id: `jamendo-${item.id}`,
        title: item.name,
        artist: item.artist_name,
        album: item.album_name || 'Jamendo Single',
        duration: item.duration || 180,
        url: item.audio,
        artwork:
          item.image ||
          `https://picsum.photos/seed/jamendo-${item.id}/400/400`,
        accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
        genre:
          item.musicinfo?.tags?.genres?.[0] || 'Creative Commons',
        format: 'MP3' as const,
        bitrate: '192 kbps',
        sampleRate: '44.1 kHz',
        isFavorite: false,
        isOnline: true,
        source: 'jamendo' as const,
        sourceLabel: 'Jamendo (Full Track)',
        license: 'Creative Commons (Free to Stream)',
        isStreamPreview: false,
        sourceWebUrl: item.shareurl,
        dateAdded: Date.now(),
        playCount: 0,
      }));
  } catch (error) {
    console.warn('Jamendo API search note:', error);
    return [];
  }
}

/**
 * Searches iTunes Search API for authorized 30-second preview clips
 */
export async function searchItunes(query: string, limit = 15): Promise<Song[]> {
  try {
    const url = `https://itunes.apple.com/search?media=music&entity=song&term=${encodeURIComponent(
      query
    )}&limit=${limit}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results
      .filter((item: { previewUrl?: string }) => Boolean(item.previewUrl))
      .map((item: {
        trackId: number;
        trackName: string;
        artistName: string;
        collectionName?: string;
        previewUrl: string;
        artworkUrl100?: string;
        primaryGenreName?: string;
        trackTimeMillis?: number;
        trackViewUrl?: string;
      }, idx: number) => ({
        id: `itunes-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        duration: Math.round((item.trackTimeMillis || 30000) / 1000),
        url: item.previewUrl,
        // High resolution artwork
        artwork: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        accentColor: ACCENT_COLORS[(idx + 2) % ACCENT_COLORS.length],
        genre: item.primaryGenreName || 'Popular',
        format: 'AAC' as const,
        bitrate: '256 kbps',
        sampleRate: '44.1 kHz',
        isFavorite: false,
        isOnline: true,
        source: 'itunes' as const,
        sourceLabel: 'Apple Music (Preview Clip)',
        license: 'Authorized 30s Preview Stream',
        isStreamPreview: true,
        sourceWebUrl: item.trackViewUrl,
        dateAdded: Date.now(),
        playCount: 0,
      }));
  } catch (error) {
    console.warn('iTunes API search note:', error);
    return [];
  }
}

/**
 * Searches Internet Archive Audio collections for public domain & open music recordings
 */
export async function searchArchive(query: string, limit = 10): Promise<Song[]> {
  try {
    const cleanQuery = encodeURIComponent(`${query} AND mediatype:audio`);
    const url = `https://archive.org/advancedsearch.php?q=${cleanQuery}&fl[]=identifier,title,creator,description,year,genre&rows=${limit}&output=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const data = await response.json();

    const docs = data.response?.docs;
    if (!docs || !Array.isArray(docs)) return [];

    // Map each identifier to standard archive stream URL
    return docs.map((doc: {
      identifier: string;
      title?: string;
      creator?: string;
      year?: string;
      genre?: string;
    }, idx: number) => {
      const streamUrl = `https://archive.org/download/${doc.identifier}/${doc.identifier}_vbr.mp3`;
      return {
        id: `archive-${doc.identifier}`,
        title: doc.title || 'Archived Audio Track',
        artist: doc.creator || 'Internet Archive Contributor',
        album: 'Public Audio Archive',
        duration: 210,
        url: streamUrl,
        artwork: `https://archive.org/services/img/${doc.identifier}`,
        accentColor: ACCENT_COLORS[(idx + 4) % ACCENT_COLORS.length],
        genre: doc.genre || 'Public Domain',
        format: 'MP3' as const,
        bitrate: '192 kbps',
        sampleRate: '44.1 kHz',
        isFavorite: false,
        isOnline: true,
        source: 'archive' as const,
        sourceLabel: 'Internet Archive (Open Audio)',
        license: 'Public Domain / Open Access',
        isStreamPreview: false,
        sourceWebUrl: `https://archive.org/details/${doc.identifier}`,
        dateAdded: Date.now(),
        playCount: 0,
      };
    });
  } catch (error) {
    console.warn('Archive.org search note:', error);
    return [];
  }
}

/**
 * Unified Online Music Search with source filtering
 */
export async function searchOnlineMusic(
  query: string,
  filter: OnlineSourceFilter = 'all'
): Promise<Song[]> {
  if (!query.trim()) return [];

  const promises: Promise<Song[]>[] = [];

  if (filter === 'all' || filter === 'jamendo') {
    promises.push(searchJamendo(query, 12));
  }
  if (filter === 'all' || filter === 'itunes') {
    promises.push(searchItunes(query, 10));
  }
  if (filter === 'all' || filter === 'archive') {
    promises.push(searchArchive(query, 6));
  }

  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Fetches featured / trending online tracks for instant browsing
 */
export async function getTrendingOnlineTracks(): Promise<{
  chillout: Song[];
  electronic: Song[];
  classical: Song[];
}> {
  try {
    const [chillout, electronic, classical] = await Promise.all([
      searchJamendo('chillout ambient', 8),
      searchJamendo('synthwave electro', 8),
      searchJamendo('piano instrumental', 8),
    ]);

    return { chillout, electronic, classical };
  } catch {
    return { chillout: [], electronic: [], classical: [] };
  }
}
