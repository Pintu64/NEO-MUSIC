import { Song, EqualizerSettings } from '../types/music';
import { generateSyntheticTrackBlob } from './proceduralAudio';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class AudioEngine {
  private static instance: AudioEngine;
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private virtualizerDelay: DelayNode | null = null;
  private virtualizerGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private currentSong: Song | null = null;
  private isInitialized = false;
  private generatedBlobs: Map<string, string> = new Map();
  private userVolume = 1.0;
  private isBuffering = false;

  // Callbacks
  public onTimeUpdate: ((currentTime: number, duration: number) => void) | null = null;
  public onTrackEnd: (() => void) | null = null;
  public onStateChange: ((isPlaying: boolean) => void) | null = null;
  public onBufferChange: ((isBuffering: boolean) => void) | null = null;
  public onError: ((errorMsg: string) => void) | null = null;

  private pauseOnDisconnect = true;

  private constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate && !isNaN(this.audioElement.duration)) {
        this.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onTrackEnd) {
        this.onTrackEnd();
      }
    });

    this.audioElement.addEventListener('play', () => {
      this.isBuffering = false;
      if (this.onBufferChange) this.onBufferChange(false);
      if (this.onStateChange) this.onStateChange(true);
      this.updateMediaSessionPlaybackState('playing');
    });

    this.audioElement.addEventListener('pause', () => {
      this.isBuffering = false;
      if (this.onBufferChange) this.onBufferChange(false);
      if (this.onStateChange) this.onStateChange(false);
      this.updateMediaSessionPlaybackState('paused');
    });

    this.audioElement.addEventListener('waiting', () => {
      this.isBuffering = true;
      if (this.onBufferChange) this.onBufferChange(true);
    });

    this.audioElement.addEventListener('playing', () => {
      this.isBuffering = false;
      if (this.onBufferChange) this.onBufferChange(false);
    });

    this.audioElement.addEventListener('canplay', () => {
      this.isBuffering = false;
      if (this.onBufferChange) this.onBufferChange(false);
    });

    this.audioElement.addEventListener('error', () => {
      this.isBuffering = false;
      if (this.onBufferChange) this.onBufferChange(false);
      // If error occurs and crossorigin was anonymous, retry once without crossorigin
      if (this.audioElement.crossOrigin) {
        this.audioElement.removeAttribute('crossorigin');
        this.audioElement.load();
        this.audioElement.play().catch(() => {
          if (this.onError) {
            this.onError('Unable to stream audio track. Check network connection or try another song.');
          }
        });
        return;
      }
      if (this.onError) {
        this.onError('Unable to stream audio track. Check network connection or try another song.');
      }
    });

    // Listen for device changes (Bluetooth/Headphones disconnected)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        if (this.pauseOnDisconnect && !this.audioElement.paused) {
          this.pause();
        }
      });
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public async initAudioContext(): Promise<void> {
    if (this.isInitialized && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.userVolume;

      // Spectrum Analyser
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Source node from HTML5 Audio
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);

      // Bass Boost (LowShelf @ 80Hz)
      this.bassBoostFilter = this.audioCtx.createBiquadFilter();
      this.bassBoostFilter.type = 'lowshelf';
      this.bassBoostFilter.frequency.value = 80;
      this.bassBoostFilter.gain.value = 0;

      // 10-Band EQ Filters
      this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // 3D Virtualizer / Spatializer using subtle stereo delay
      this.virtualizerDelay = this.audioCtx.createDelay();
      this.virtualizerDelay.delayTime.value = 0.015; // 15ms Haas effect
      this.virtualizerGain = this.audioCtx.createGain();
      this.virtualizerGain.gain.value = 0.0;

      // Connect DSP chain
      let lastNode: AudioNode = this.sourceNode;

      lastNode.connect(this.bassBoostFilter);
      lastNode = this.bassBoostFilter;

      for (const filter of this.eqFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      // Virtualizer parallel path
      lastNode.connect(this.virtualizerDelay);
      this.virtualizerDelay.connect(this.virtualizerGain);
      this.virtualizerGain.connect(this.masterGain);

      // Direct path
      lastNode.connect(this.masterGain);

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization note:', e);
    }
  }

  public async loadAndPlaySong(song: Song): Promise<void> {
    await this.initAudioContext();
    this.currentSong = song;

    let audioSrc = song.url;

    // If procedural track, generate synthetic blob
    if (!audioSrc && song.id.startsWith('neo-')) {
      if (this.generatedBlobs.has(song.id)) {
        audioSrc = this.generatedBlobs.get(song.id)!;
      } else {
        audioSrc = await generateSyntheticTrackBlob(song.id, Math.min(song.duration || 180, 240));
        this.generatedBlobs.set(song.id, audioSrc);
      }
    }

    if (!audioSrc) {
      if (this.onError) this.onError('No audio source URL available for this track.');
      return;
    }

    // Reset volume in case sleep timer faded out
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.userVolume, this.audioCtx.currentTime);
    }

    this.isBuffering = true;
    if (this.onBufferChange) this.onBufferChange(true);

    this.audioElement.src = audioSrc;
    this.audioElement.playbackRate = 1.0;
    this.audioElement.currentTime = 0;

    this.setupMediaSession(song);

    try {
      await this.audioElement.play();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
    } catch (err) {
      console.warn('Playback play request prevented by autoplay policy:', err);
    }
  }

  public async retryCurrentSong(): Promise<void> {
    if (this.currentSong) {
      await this.loadAndPlaySong(this.currentSong);
    }
  }

  public async play(): Promise<void> {
    await this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.userVolume, this.audioCtx.currentTime);
    }
    await this.audioElement.play();
  }

  public pause(): void {
    this.audioElement.pause();
  }

  public togglePlay(): void {
    if (this.audioElement.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number): void {
    if (!isNaN(this.audioElement.duration)) {
      const clamped = Math.max(0, Math.min(seconds, this.audioElement.duration));
      this.audioElement.currentTime = clamped;
    }
  }

  public seekRelative(deltaSeconds: number): void {
    this.seek(this.audioElement.currentTime + deltaSeconds);
  }

  public setVolume(volume: number): void {
    const val = Math.max(0, Math.min(1, volume));
    this.userVolume = val;
    this.audioElement.volume = val;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }

  public async fadeOutAndPause(fadeDurationSec = 10): Promise<void> {
    if (!this.isPlaying()) return;

    if (this.masterGain && this.audioCtx) {
      const currTime = this.audioCtx.currentTime;
      this.masterGain.gain.setValueAtTime(this.userVolume, currTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, currTime + fadeDurationSec);

      setTimeout(() => {
        this.pause();
        if (this.masterGain && this.audioCtx) {
          this.masterGain.gain.setValueAtTime(this.userVolume, this.audioCtx.currentTime);
        }
      }, fadeDurationSec * 1000);
    } else {
      this.pause();
    }
  }

  public setPlaybackRate(rate: number): void {
    this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, rate));
  }

  public setPauseOnDisconnect(pause: boolean): void {
    this.pauseOnDisconnect = pause;
  }

  public applyEqualizer(settings: EqualizerSettings): void {
    if (!this.isInitialized) return;

    this.eqFilters.forEach((filter, idx) => {
      const gain = settings.enabled ? (settings.bands[idx] ?? 0) : 0;
      filter.gain.setTargetAtTime(gain, this.audioCtx!.currentTime, 0.05);
    });

    if (this.bassBoostFilter) {
      const bassGain = settings.enabled ? (settings.bassBoost / 100) * 12 : 0;
      this.bassBoostFilter.gain.setTargetAtTime(bassGain, this.audioCtx!.currentTime, 0.05);
    }

    if (this.virtualizerGain) {
      const virtGain = settings.enabled ? (settings.virtualizer / 100) * 0.45 : 0;
      this.virtualizerGain.gain.setTargetAtTime(virtGain, this.audioCtx!.currentTime, 0.05);
    }
  }

  public getSpectrumData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64);
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public isPlaying(): boolean {
    return !this.audioElement.paused && !this.audioElement.ended;
  }

  public getBufferingState(): boolean {
    return this.isBuffering;
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement.duration || (this.currentSong?.duration ?? 0);
  }

  public getCurrentSong(): Song | null {
    return this.currentSong;
  }

  private setupMediaSession(song: Song): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: song.artwork, sizes: '512x512', type: 'image/svg+xml' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seekRelative(-(details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seekRelative(details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('MediaSession handler warning:', err);
    }
  }

  public updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }
}
