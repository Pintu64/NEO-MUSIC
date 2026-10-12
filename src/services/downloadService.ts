import { Song } from '../types/music';
import { generateSyntheticTrackBlob } from './proceduralAudio';

const DB_NAME = 'neomusic_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloaded_tracks';

export interface StoredOfflineTrack {
  id: string;
  song: Song;
  audioBlob: Blob;
  downloadedAt: number;
  sizeBytes: number;
}

export interface DownloadProgressInfo {
  songId: string;
  progress: number; // 0 - 100
  status: 'idle' | 'downloading' | 'completed' | 'error';
  error?: string;
  receivedBytes?: number;
  totalBytes?: number;
}

/**
 * Open or create IndexedDB instance for offline music caching
 */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open offline music database'));
  });
}

/**
 * Clean strings for safe MP3 filenames
 */
function cleanFilename(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'Track';
}

/**
 * Triggers native browser / Android file download to save the .mp3 file into
 * the device's storage (e.g. /storage/emulated/0/Download/)
 */
export function triggerNativeDeviceDownload(blob: Blob, filename: string): void {
  try {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      // Revoke after safe delay
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    }, 100);
  } catch (err) {
    console.warn('Native file save trigger exception:', err);
  }
}

/**
 * Downloads an online track with progress reporting, caches into IndexedDB,
 * and triggers a device file download.
 */
export async function downloadOnlineTrack(
  song: Song,
  onProgress?: (info: DownloadProgressInfo) => void
): Promise<{ song: Song; blob: Blob; objectUrl: string }> {
  const updateProgress = (pct: number, status: DownloadProgressInfo['status'] = 'downloading', error?: string) => {
    if (onProgress) {
      onProgress({
        songId: song.id,
        progress: Math.min(100, Math.max(0, Math.round(pct))),
        status,
        error,
      });
    }
  };

  updateProgress(5, 'downloading');

  let audioBlob: Blob;

  try {
    // If procedural / synthetic track
    if (!song.url || song.id.startsWith('neo-') || song.source === 'procedural') {
      updateProgress(25);
      const synthUrl = await generateSyntheticTrackBlob(song.id, Math.min(song.duration || 180, 240));
      updateProgress(70);
      const res = await fetch(synthUrl);
      audioBlob = await res.blob();
    } else {
      // Real streaming audio track
      updateProgress(15);
      const response = await fetch(song.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio stream (HTTP ${response.status})`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        audioBlob = await response.blob();
      } else {
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total > 0) {
              const pct = 15 + (received / total) * 75;
              updateProgress(pct);
            } else {
              // Simulated progress if no content-length
              updateProgress(Math.min(85, 15 + chunks.length * 3));
            }
          }
        }

        audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      }
    }

    updateProgress(90);

    // Save to device Downloads folder
    const filename = `${cleanFilename(song.artist)} - ${cleanFilename(song.title)}.mp3`;
    triggerNativeDeviceDownload(audioBlob, filename);

    // Store in IndexedDB for 100% offline playback
    const db = await openOfflineDB();
    const objectUrl = URL.createObjectURL(audioBlob);

    const offlineSong: Song = {
      ...song,
      isDownloaded: true,
      downloadedAt: Date.now(),
      downloadSize: audioBlob.size,
      folder: 'Downloads',
      format: 'MP3',
      url: objectUrl,
      isOnline: false,
      dateAdded: Date.now(),
    };

    const record: StoredOfflineTrack = {
      id: song.id,
      song: offlineSong,
      audioBlob,
      downloadedAt: Date.now(),
      sizeBytes: audioBlob.size,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    updateProgress(100, 'completed');

    return { song: offlineSong, blob: audioBlob, objectUrl };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown download error';
    updateProgress(0, 'error', errorMsg);
    throw error;
  }
}

/**
 * Loads all offline cached songs from IndexedDB on application boot
 */
export async function loadAllDownloadedSongs(): Promise<Song[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result || []) as StoredOfflineTrack[];
        const loadedSongs: Song[] = records.map((rec) => {
          const blobUrl = URL.createObjectURL(rec.audioBlob);
          return {
            ...rec.song,
            isDownloaded: true,
            downloadedAt: rec.downloadedAt,
            downloadSize: rec.sizeBytes,
            url: blobUrl,
            folder: 'Downloads',
          };
        });
        resolve(loadedSongs);
      };

      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('Could not load downloaded songs from IndexedDB:', e);
    return [];
  }
}

/**
 * Removes a downloaded track from IndexedDB
 */
export async function deleteDownloadedSong(songId: string): Promise<void> {
  try {
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(songId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not delete downloaded track:', e);
  }
}
