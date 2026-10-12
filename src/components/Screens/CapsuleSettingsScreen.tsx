import React from 'react';
import {
  Radio,
  Sliders,
  Clock,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { DynamicCapsuleSettings } from '../../types/music';

interface CapsuleSettingsScreenProps {
  settings: DynamicCapsuleSettings;
  onUpdateSettings: (newSettings: DynamicCapsuleSettings) => void;
}

export const CapsuleSettingsScreen: React.FC<CapsuleSettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="space-y-5 pb-28 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Dynamic Capsule Settings
        </h1>
        <p className="text-xs text-slate-400">
          Android floating popup &amp; Dynamic Island style overlay
        </p>
      </div>

      {/* Master Enable Toggle */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic Capsule Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Displays interactive pill showing artwork, title, and playback status.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              onUpdateSettings({ ...settings, enabled: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Floating Overlay Mode */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              System Floating Overlay Mode
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                WindowManager
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Keeps capsule visible over other apps using Android SYSTEM_ALERT_WINDOW.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.overlayMode}
            onChange={(e) =>
              onUpdateSettings({ ...settings, overlayMode: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Capsule Size */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Capsule Pill Size</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 capitalize">
            {settings.size || 'standard'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['compact', 'standard', 'large'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => onUpdateSettings({ ...settings, size: sz })}
              className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                settings.size === sz
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Sound Wave Animation Toggle */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Equalizer Waveform Bars</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Renders real-time bouncing audio bars inside the compact capsule pill.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.showWaveform}
            onChange={(e) =>
              onUpdateSettings({ ...settings, showWaveform: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
        </label>
      </div>

      {/* Position Offset Slider */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Vertical Position Offset</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {settings.positionY}px
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Calibrates vertical distance from top screen bezel to align with camera punch-hole cutout.
        </p>
        <input
          type="range"
          min={10}
          max={90}
          value={settings.positionY}
          onChange={(e) =>
            onUpdateSettings({
              ...settings,
              positionY: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span>Top Edge (10px)</span>
          <span>Center (50px)</span>
          <span>Lower (90px)</span>
        </div>
      </div>

      {/* Auto-Collapse Duration */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Auto-Collapse Expanded Capsule</h3>
        </div>
        <p className="text-xs text-slate-400">
          Automatically folds the expanded player card back into the subtle pill after inactivity.
        </p>

        <div className="grid grid-cols-4 gap-2">
          {[0, 3, 5, 10].map((sec) => (
            <button
              key={sec}
              onClick={() =>
                onUpdateSettings({ ...settings, autoCollapseSeconds: sec })
              }
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                settings.autoCollapseSeconds === sec
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {sec === 0 ? 'Manual' : `${sec}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Android System Permission Instructions */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 bg-slate-950/60">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Android Overlay Permission Guide
        </h4>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Floating Window:</strong> Go to <em>Settings &gt; Apps &gt; Special App Access &gt; Display over other apps</em> and enable NeoMusic.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Unrestricted Battery:</strong> Select <em>Unrestricted / No restrictions</em> in Battery Optimization to keep audio playing smoothly in the background.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
