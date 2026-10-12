/**
 * Procedural Music Engine for NeoMusic
 * Generates rich, relaxing, high-fidelity synthesizer compositions
 * entirely in real-time using Web Audio API nodes so music plays
 * instantly with zero latency and zero external bandwidth.
 */

export interface TrackComposition {
  tempo: number;
  scale: number[];
  baseFreq: number;
  chords: number[][];
  leadPattern: number[];
  genre: string;
}

export const TRACK_COMPOSITIONS: Record<string, TrackComposition> = {
  'neo-1': {
    // Cyber Neon 2077 (Neo 10 Origin Theme)
    tempo: 110,
    baseFreq: 110, // A2
    scale: [0, 3, 5, 7, 10, 12, 15, 17], // Minor pentatonic + blues
    chords: [
      [0, 7, 12, 15],
      [3, 7, 10, 15],
      [5, 8, 12, 17],
      [2, 7, 10, 14],
    ],
    leadPattern: [0, 3, 7, 10, 12, 10, 7, 5, 7, 10, 12, 15, 12, 10, 7, 3],
    genre: 'Synthwave / Cyber',
  },
  'neo-2': {
    // Liquid Glass Nocturne
    tempo: 82,
    baseFreq: 130.81, // C3
    scale: [0, 2, 4, 7, 9, 12, 14, 16], // Major pentatonic
    chords: [
      [0, 4, 7, 11],
      [5, 9, 12, 16],
      [9, 12, 16, 19],
      [7, 11, 14, 17],
    ],
    leadPattern: [7, 9, 11, 12, 16, 14, 12, 9, 7, 4, 7, 9, 12, 14, 11, 7],
    genre: 'Liquid Chillout',
  },
  'neo-3': {
    // OriginOS Midnight Pulse
    tempo: 96,
    baseFreq: 98, // G2
    scale: [0, 2, 3, 5, 7, 8, 10, 12], // Natural minor
    chords: [
      [0, 7, 10, 15],
      [8, 12, 15, 19],
      [5, 8, 12, 17],
      [7, 10, 14, 17],
    ],
    leadPattern: [0, 7, 12, 10, 8, 7, 5, 3, 5, 7, 10, 12, 15, 14, 12, 7],
    genre: 'Lo-Fi Neo Beats',
  },
  'neo-4': {
    // 144Hz Quantum Horizon
    tempo: 124,
    baseFreq: 146.83, // D3
    scale: [0, 3, 5, 6, 7, 10, 12, 15], // Dorian blues
    chords: [
      [0, 7, 12, 15],
      [5, 8, 12, 17],
      [10, 14, 17, 21],
      [7, 10, 14, 17],
    ],
    leadPattern: [12, 10, 7, 5, 7, 10, 12, 15, 17, 15, 12, 10, 7, 6, 5, 3],
    genre: 'Progressive Electro',
  },
  'neo-5': {
    // Aurora Velvet
    tempo: 75,
    baseFreq: 164.81, // E3
    scale: [0, 2, 4, 7, 9, 12, 14, 16],
    chords: [
      [0, 4, 7, 12],
      [4, 7, 11, 14],
      [5, 9, 12, 16],
      [7, 11, 14, 19],
    ],
    leadPattern: [4, 7, 9, 12, 14, 16, 14, 12, 9, 7, 4, 2, 4, 7, 9, 11],
    genre: 'Ambient Dreamscape',
  },
};

/**
 * Synthesizes an actual audio WAV Blob of specified duration so the HTML5 Audio
 * element and Web Audio graph can seek, loop, read duration, and process it like
 * a genuine high-res audio track!
 */
export async function generateSyntheticTrackBlob(trackId: string, durationSeconds = 180): Promise<string> {
  const comp = TRACK_COMPOSITIONS[trackId] || TRACK_COMPOSITIONS['neo-1'];
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = sampleRate * durationSeconds;

  // Use OfflineAudioContext to render music into high-fidelity stereo buffer
  const offlineCtx = new OfflineAudioContext(numChannels, totalSamples, sampleRate);

  const beatDuration = 60 / comp.tempo;
  const barDuration = beatDuration * 4;
  const totalBars = Math.ceil(durationSeconds / barDuration);

  // Master bus
  const masterBus = offlineCtx.createGain();
  masterBus.gain.value = 0.7;

  // Reverb simulation
  const convolver = offlineCtx.createConvolver();
  convolver.buffer = createImpulseResponse(offlineCtx, 1.8, 2.0);
  const reverbGain = offlineCtx.createGain();
  reverbGain.gain.value = 0.25;
  masterBus.connect(convolver);
  convolver.connect(reverbGain);
  reverbGain.connect(offlineCtx.destination);
  masterBus.connect(offlineCtx.destination);

  // Bass Synth
  for (let bar = 0; bar < totalBars; bar++) {
    const chordIndex = bar % comp.chords.length;
    const chord = comp.chords[chordIndex];
    const barTime = bar * barDuration;

    // Bass note
    const rootInterval = chord[0];
    const bassFreq = (comp.baseFreq * 0.5) * Math.pow(2, rootInterval / 12);
    
    // 2 bass pulses per bar
    for (let p = 0; p < 2; p++) {
      const pulseTime = barTime + p * (barDuration / 2);
      if (pulseTime >= durationSeconds) break;

      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, pulseTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, pulseTime);
      filter.frequency.exponentialRampToValueAtTime(120, pulseTime + 0.8);

      gain.gain.setValueAtTime(0.001, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.35, pulseTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + (barDuration / 2) * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterBus);

      osc.start(pulseTime);
      osc.stop(pulseTime + (barDuration / 2));
    }

    // Warm Chord Pad
    chord.forEach((interval, idx) => {
      const padFreq = comp.baseFreq * Math.pow(2, interval / 12);
      const padOsc = offlineCtx.createOscillator();
      const padGain = offlineCtx.createGain();
      const panner = offlineCtx.createStereoPanner ? offlineCtx.createStereoPanner() : null;

      padOsc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      padOsc.frequency.setValueAtTime(padFreq, barTime);

      padGain.gain.setValueAtTime(0.001, barTime);
      padGain.gain.linearRampToValueAtTime(0.08 / (idx + 1), barTime + 0.4);
      padGain.gain.setValueAtTime(0.08 / (idx + 1), barTime + barDuration - 0.4);
      padGain.gain.linearRampToValueAtTime(0.001, barTime + barDuration);

      if (panner) {
        panner.pan.setValueAtTime((idx % 2 === 0 ? -0.4 : 0.4), barTime);
        padOsc.connect(padGain);
        padGain.connect(panner);
        panner.connect(masterBus);
      } else {
        padOsc.connect(padGain);
        padGain.connect(masterBus);
      }

      padOsc.start(barTime);
      padOsc.stop(barTime + barDuration);
    });

    // Melodic Lead Plucks
    for (let step = 0; step < 16; step++) {
      const stepTime = barTime + step * (barDuration / 16);
      if (stepTime >= durationSeconds) break;

      // Select note from pattern
      const noteIdx = (bar * 4 + step) % comp.leadPattern.length;
      const interval = comp.leadPattern[noteIdx];
      const leadFreq = (comp.baseFreq * 2) * Math.pow(2, interval / 12);

      // Rhythm gate
      if (step % 2 === 0 || step === 7 || step === 11) {
        const leadOsc = offlineCtx.createOscillator();
        const leadGain = offlineCtx.createGain();
        const leadFilter = offlineCtx.createBiquadFilter();

        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(leadFreq, stepTime);

        leadFilter.type = 'bandpass';
        leadFilter.frequency.setValueAtTime(leadFreq * 1.5, stepTime);
        leadFilter.Q.value = 2.0;

        leadGain.gain.setValueAtTime(0.001, stepTime);
        leadGain.gain.exponentialRampToValueAtTime(0.12, stepTime + 0.02);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, stepTime + (beatDuration * 0.4));

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(masterBus);

        leadOsc.start(stepTime);
        leadOsc.stop(stepTime + (beatDuration * 0.5));
      }
    }

    // Soft Ambient Kick & Hi-hat (Gentle, elegant rhythm)
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = barTime + beat * beatDuration;
      if (beatTime >= durationSeconds) break;

      // Kick drum on 0 and 2
      if (beat === 0 || beat === 2) {
        const kickOsc = offlineCtx.createOscillator();
        const kickGain = offlineCtx.createGain();
        kickOsc.frequency.setValueAtTime(140, beatTime);
        kickOsc.frequency.exponentialRampToValueAtTime(38, beatTime + 0.12);

        kickGain.gain.setValueAtTime(0.3, beatTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.25);

        kickOsc.connect(kickGain);
        kickGain.connect(masterBus);
        kickOsc.start(beatTime);
        kickOsc.stop(beatTime + 0.26);
      }

      // Shaker / Hi-hat on 8th notes
      const hatTime = beatTime + beatDuration * 0.5;
      const noiseBuffer = createNoiseBuffer(offlineCtx, 0.04);
      const noiseSource = offlineCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const hatFilter = offlineCtx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.value = 6500;
      const hatGain = offlineCtx.createGain();
      hatGain.gain.setValueAtTime(0.04, hatTime);
      hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.04);

      noiseSource.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(masterBus);
      noiseSource.start(hatTime);
      noiseSource.stop(hatTime + 0.05);
    }
  }

  // Render offline buffer to audio
  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlobUrl(renderedBuffer);
}

function createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const factor = Math.pow(1 - i / length, decay);
    left[i] = (Math.random() * 2 - 1) * factor;
    right[i] = (Math.random() * 2 - 1) * factor;
  }
  return impulse;
}

function createNoiseBuffer(ctx: BaseAudioContext, duration: number): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Encodes AudioBuffer into a WAV Blob URL
 */
function audioBufferToWavBlobUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataByteCount = numSamples * blockAlign;
  const headerByteCount = 44;
  const totalByteCount = headerByteCount + dataByteCount;

  const arrayBuffer = new ArrayBuffer(totalByteCount);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteCount, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteCount, true);

  // Write PCM data
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
