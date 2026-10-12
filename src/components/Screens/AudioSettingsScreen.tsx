import React from 'react';
import {
  Volume2,
  Headphones,
  Sliders,
  Moon,
  Sun,
  Palette,
  Clock,
  Zap,
  Gauge,
  Layers,
  Shuffle,
  RotateCw,
} from 'lucide-react';
import { AudioSettings } from '../../types/music';

interface AudioSettingsScreenProps {
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
}

const ACCENT_PRESETS = [
  { name: 'Studio Gold', hex: '#eab308' },
  { name: 'Precision Cyan', hex: '#06b6d4' },
  { name: 'Braun Orange', hex: '#f97316' },
  { name: 'Signal Emerald', hex: '#10b981' },
  { name: 'Titanium Silver', hex: '#94a3b8' },
  { name: 'Monitor Crimson', hex: '#ef4444' },
];

export const AudioSettingsScreen: React.FC<AudioSettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="space-y-5 pb-28 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Playback &amp; Display Settings
        </h1>
        <p className="text-xs text-slate-400">
          Audio engine behavior, studio finishes, and playback intervals
        </p>
      </div>

      {/* Theme & Accent Color Customization */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Studio Finish &amp; Theme</h3>
              <p className="text-xs text-slate-400">Obsidian Black, Graphite, or Pure Light</p>
            </div>
          </div>

          {/* 3-way Theme Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium">
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                settings.theme === 'dark'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Obsidian</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'graphite' })}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                settings.theme === 'graphite'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Graphite</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Hardware Accent Color:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ACCENT_PRESETS.map((color) => (
              <button
                key={color.hex}
                onClick={() => onUpdateSettings({ ...settings, accentColor: color.hex })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  settings.accentColor === color.hex
                    ? 'border-white bg-white/15 text-white shadow'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Shuffle vs Random Mode */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Weighted Shuffle</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Balances artist variety, favors favorites, and avoids playing the same artist back-to-back.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.smartShuffle}
            onChange={(e) =>
              onUpdateSettings({ ...settings, smartShuffle: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
        </label>
      </div>

      {/* Configurable Skip Intervals (5s, 10s, 15s, 30s) */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Skip &amp; Seek Interval</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {settings.skipIntervalSeconds} seconds
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Duration jumped when pressing rewind or forward buttons in Now Playing and Dynamic Capsule.
        </p>
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[5, 10, 15, 30].map((sec) => (
            <button
              key={sec}
              onClick={() => onUpdateSettings({ ...settings, skipIntervalSeconds: sec })}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                settings.skipIntervalSeconds === sec
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Timer with Gradual Volume Fade-out */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Gradual Sleep Timer Fade-Out</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Smoothly reduces master volume over 15 seconds before pausing to prevent sudden silence awakening.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.sleepTimerFadeOut}
            onChange={(e) =>
              onUpdateSettings({ ...settings, sleepTimerFadeOut: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Headphone Disconnection Safe Auto-Pause */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pause on Headphone Disconnect</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Safely pauses playback when wired headphones or Bluetooth devices disconnect.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.pauseOnHeadphoneDisconnect}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                pauseOnHeadphoneDisconnect: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Gapless Playback */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Gapless Playback</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Eliminates silence between consecutive tracks in live concerts and continuous albums.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.gaplessPlayback}
            onChange={(e) =>
              onUpdateSettings({ ...settings, gaplessPlayback: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
        </label>
      </div>

      {/* Resume on Startup */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Resume Session on App Startup</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restores last played song and seek position when reopening NeoMusic.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.resumeOnStartup}
            onChange={(e) =>
              onUpdateSettings({ ...settings, resumeOnStartup: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

      {/* Crossfade Duration Slider */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Crossfade Duration</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {settings.crossfadeDuration}s
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Smoothly overlaps the ending of the current track with the next track.
        </p>
        <input
          type="range"
          min={0}
          max={8}
          step={1}
          value={settings.crossfadeDuration}
          onChange={(e) =>
            onUpdateSettings({
              ...settings,
              crossfadeDuration: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span>Off (0s)</span>
          <span>4s</span>
          <span>8s</span>
        </div>
      </div>
    </div>
  );
};
