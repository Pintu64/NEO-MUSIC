import { Song, Playlist, DuplicateGroup } from '../types/music';

/**
 * Smart Shuffle:
 * - Prevents back-to-back songs by the same artist
 * - Balances favorite songs with undiscovered library tracks
 * - Weights songs based on listening recency and playCount
 */
export function smartShuffle(songs: Song[], currentSongId?: string): Song[] {
  if (songs.length <= 1) return [...songs];

  const pool = songs.filter((s) => s.id !== currentSongId);

  // Score each track locally based on favorites and variety
  const scored = pool.map((song) => {
    let score = Math.random() * 50; // Random baseline
    if (song.isFavorite) score += 25;
    if ((song.playCount || 0) > 0) score += Math.min(15, (song.playCount || 0) * 2);
    // Give bonus to songs not played recently
    if (!song.lastPlayed || Date.now() - song.lastPlayed > 1000 * 60 * 60 * 24 * 3) {
      score += 15;
    }
    return { song, score };
  });

  // Sort primarily by score with randomness
  scored.sort((a, b) => b.score - a.score);

  // Reorder to ensure artist variety (no two songs by same artist adjacent)
  const result: Song[] = [];
  const remaining = scored.map((item) => item.song);

  let lastArtist = '';
  while (remaining.length > 0) {
    let pickedIndex = -1;

    // Look for a track by a different artist
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].artist.toLowerCase() !== lastArtist.toLowerCase()) {
        pickedIndex = i;
        break;
      }
    }

    // Fallback if only same artist remaining
    if (pickedIndex === -1) {
      pickedIndex = 0;
    }

    const [chosen] = remaining.splice(pickedIndex, 1);
    result.push(chosen);
    lastArtist = chosen.artist;
  }

  // If a current song was playing, keep it at top of playback
  if (currentSongId) {
    const current = songs.find((s) => s.id === currentSongId);
    if (current) result.unshift(current);
  }

  return result;
}

/**
 * Identifies duplicate tracks in library based on normalized title, artist, and duration
 */
export function detectDuplicates(songs: Song[]): DuplicateGroup[] {
  const groups: Record<string, Song[]> = {};

  songs.forEach((song) => {
    const cleanTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanArtist = song.artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const durationBracket = Math.round(song.duration / 4) * 4; // 4-second bucket

    const key = `${cleanTitle}_${cleanArtist}_${durationBracket}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(song);
  });

  const duplicateGroups: DuplicateGroup[] = [];

  Object.entries(groups).forEach(([key, groupSongs]) => {
    if (groupSongs.length > 1) {
      duplicateGroups.push({
        key,
        songs: groupSongs,
        reason: `Matching track "${groupSongs[0].title}" by ${groupSongs[0].artist} (${groupSongs.length} copies)`,
      });
    }
  });

  return duplicateGroups;
}

/**
 * Detects songs with missing or placeholder artwork
 */
export function detectMissingArtwork(songs: Song[]): Song[] {
  return songs.filter((s) => !s.artwork || s.hasCustomArt === false);
}

/**
 * Generates local Smart Playlists based on audio metadata, estimated tempo, and genres
 */
export function generateSmartPlaylists(songs: Song[]): Playlist[] {
  const favSongs = songs.filter((s) => s.isFavorite);
  
  // Focus: Mid tempo, instrumental, ambient or chillout (tempo 75 - 105)
  const focusSongs = songs.filter((s) => {
    const tempo = s.tempoBpm || 90;
    const g = (s.genre || '').toLowerCase();
    return (tempo >= 75 && tempo <= 105) || g.includes('chill') || g.includes('ambient');
  });

  // Workout: Higher tempo, energetic beats (tempo > 110 or progressive / electro)
  const workoutSongs = songs.filter((s) => {
    const tempo = s.tempoBpm || 110;
    const g = (s.genre || '').toLowerCase();
    return tempo >= 110 || g.includes('electro') || g.includes('synth');
  });

  // Chill: Smooth ambient, lofi, velvet sounds
  const chillSongs = songs.filter((s) => {
    const tempo = s.tempoBpm || 80;
    const g = (s.genre || '').toLowerCase();
    return tempo <= 95 || g.includes('chill') || g.includes('lo-fi') || g.includes('ambient');
  });

  // Sleep: Gentle low tempo (< 80 bpm)
  const sleepSongs = songs.filter((s) => {
    const tempo = s.tempoBpm || 75;
    return tempo <= 82;
  });

  return [
    {
      id: 'smart-favorites',
      name: 'Favorites',
      description: 'Your starred favorite tracks',
      songIds: favSongs.map((s) => s.id),
      createdAt: Date.now(),
      isSmart: true,
      smartCategory: 'favorites',
      coverArt: favSongs[0]?.artwork || songs[0]?.artwork,
    },
    {
      id: 'smart-focus',
      name: 'Focus & Flow',
      description: 'Clean mid-tempo rhythms to maintain uninterrupted concentration',
      songIds: focusSongs.map((s) => s.id),
      createdAt: Date.now(),
      isSmart: true,
      smartCategory: 'focus',
      coverArt: focusSongs[0]?.artwork || songs[0]?.artwork,
    },
    {
      id: 'smart-chill',
      name: 'Chill & Relax',
      description: 'Smooth ambient textures and laid-back melodies',
      songIds: chillSongs.map((s) => s.id),
      createdAt: Date.now(),
      isSmart: true,
      smartCategory: 'chill',
      coverArt: chillSongs[0]?.artwork || songs[0]?.artwork,
    },
    {
      id: 'smart-workout',
      name: 'Workout Energy',
      description: 'High-energy electronic beats to drive your activity',
      songIds: workoutSongs.map((s) => s.id),
      createdAt: Date.now(),
      isSmart: true,
      smartCategory: 'workout',
      coverArt: workoutSongs[0]?.artwork || songs[0]?.artwork,
    },
    {
      id: 'smart-sleep',
      name: 'Sleep & Night',
      description: 'Gentle, soothing tracks to help you wind down',
      songIds: sleepSongs.map((s) => s.id),
      createdAt: Date.now(),
      isSmart: true,
      smartCategory: 'sleep',
      coverArt: sleepSongs[0]?.artwork || songs[0]?.artwork,
    },
  ];
}

/**
 * Returns a surprise recommendation based on user library discovery
 */
export function getSurpriseTrack(songs: Song[], currentSongId?: string): Song | null {
  if (songs.length === 0) return null;
  const pool = songs.filter((s) => s.id !== currentSongId);
  if (pool.length === 0) return songs[0];

  // Pick either a favorite track not recently played, or a random discovery
  const unplayedPool = pool.filter((s) => !s.lastPlayed);
  if (unplayedPool.length > 0 && Math.random() > 0.4) {
    return unplayedPool[Math.floor(Math.random() * unplayedPool.length)];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Local recommendations based on listening history and favorite genres
 */
export function getLocalRecommendations(songs: Song[], currentSong?: Song | null): Song[] {
  if (songs.length <= 1) return [];

  const favoriteGenres = new Set(
    songs
      .filter((s) => s.isFavorite && s.genre)
      .map((s) => s.genre!.toLowerCase())
  );

  const favArtists = new Set(
    songs
      .filter((s) => s.isFavorite)
      .map((s) => s.artist.toLowerCase())
  );

  return songs
    .filter((s) => s.id !== currentSong?.id)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.genre && favoriteGenres.has(a.genre.toLowerCase())) scoreA += 3;
      if (b.genre && favoriteGenres.has(b.genre.toLowerCase())) scoreB += 3;

      if (favArtists.has(a.artist.toLowerCase())) scoreA += 2;
      if (favArtists.has(b.artist.toLowerCase())) scoreB += 2;

      scoreA += (a.playCount || 0);
      scoreB += (b.playCount || 0);

      return scoreB - scoreA;
    })
    .slice(0, 4);
}
