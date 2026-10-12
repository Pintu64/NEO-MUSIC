import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Plus,
  Bookmark,
  Zap,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { EqualizerSettings } from '../types/music';
import { PRESET_LIST } from '../services/equalizerPresets';
import { EQ_FREQUENCIES, AudioEngine } from '../services/audioEngine';

interface EqualizerModalProps {
  settings: EqualizerSettings;
  onUpdateSettings: (newSettings: EqualizerSettings) => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [customPresetName, setCustomPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live FFT spectrum visualizer at top of equalizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const data = AudioEngine.getInstance().getSpectrumData();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / 32 - 1.5;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const val = data[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(3, percent * (canvas.height - 10));

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(0.7, '#38f9d7');
        gradient.addColorStop(1, '#ff416c');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1.5;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...settings.bands];
    newBands[index] = value;
    onUpdateSettings({
      ...settings,
      preset: 'Custom',
      bands: newBands,
    });
  };

  const handleSelectPreset = (presetName: string) => {
    const preset = PRESET_LIST.find((p) => p.name === presetName);
    if (preset) {
      onUpdateSettings({
        ...settings,
        preset: presetName,
        bands: [...preset.bands],
        bassBoost: preset.bassBoost,
        virtualizer: preset.virtualizer,
      });
    } else if (settings.customPresets[presetName]) {
      onUpdateSettings({
        ...settings,
        preset: presetName,
        bands: [...settings.customPresets[presetName]],
      });
    }
  };

  const handleSaveCustomPreset = () => {
    if (!customPresetName.trim()) return;
    onUpdateSettings({
      ...settings,
      preset: customPresetName.trim(),
      customPresets: {
        ...settings.customPresets,
        [customPresetName.trim()]: [...settings.bands],
      },
    });
    setCustomPresetName('');
    setShowSavePreset(false);
  };

  const handleReset = () => {
    onUpdateSettings({
      ...settings,
      preset: 'Normal (Flat)',
      bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bassBoost: 0,
      virtualizer: 0,
    });
  };

  const formatFreq = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-slate-950/95 border border-white/20 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                10-Band Graphic Equalizer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                  Hardware DSP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Precision Biquad Filter Array with ±12 dB safe adjustment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>

            <button
              onClick={onClose}
              aria-label="Close Equalizer"
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Audio FFT Visualizer */}
        <div className="h-16 w-full rounded-2xl glass-panel p-2 flex flex-col justify-end mb-4 border border-white/10 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={60}
            className="w-full h-full rounded"
          />
          <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-300/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE FREQUENCY SPECTRUM
          </div>
        </div>

        {/* Presets Horizontal Scroll */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Acoustic Presets
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSavePreset(!showSavePreset)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Custom
              </button>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {showSavePreset && (
            <div className="flex gap-2 mb-3 animate-in fade-in">
              <input
                type="text"
                placeholder="Custom Preset Name..."
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
                className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSaveCustomPreset}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Save
              </button>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_LIST.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  settings.preset === preset.name
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            ))}

            {/* Custom User Presets */}
            {Object.keys(settings.customPresets).map((presetName) => (
              <button
                key={presetName}
                onClick={() => handleSelectPreset(presetName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  settings.preset === presetName
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 border border-cyan-500/30 text-cyan-300 hover:bg-white/10'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                {presetName}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Vertical Sliders */}
        <div className="glass-panel p-4 rounded-2xl border border-white/15 mb-5 relative">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 px-1">
            <span>+12 dB</span>
            <span className="text-cyan-400">0 dB FLAT</span>
            <span>-12 dB</span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-2 items-center justify-items-center">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gain = settings.bands[idx] ?? 0;
              return (
                <div
                  key={freq}
                  className="flex flex-col items-center gap-2 w-full"
                >
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">
                    {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                  </span>

                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={gain}
                    disabled={!settings.enabled}
                    onChange={(e) =>
                      handleBandChange(idx, parseFloat(e.target.value))
                    }
                    className="slider-vertical cursor-pointer accent-cyan-400 disabled:opacity-30"
                  />

                  <span className="text-[10px] font-semibold text-slate-300 font-mono">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bass Boost & 3D Spatial Virtualizer Knobs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Bass Enhancement
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {settings.bassBoost}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Sub-bass harmonic warmth within safe speaker and ear limits.
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.bassBoost}
              disabled={!settings.enabled}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  preset: 'Custom',
                  bassBoost: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
            />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  3D Spatial Virtualizer
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {settings.virtualizer}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Expands stereo soundstage via acoustic interaural phase delay.
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.virtualizer}
              disabled={!settings.enabled}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  preset: 'Custom',
                  virtualizer: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-400 disabled:opacity-30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
