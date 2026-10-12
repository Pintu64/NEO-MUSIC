import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  BatteryCharging,
  Cpu,
  Smartphone,
  EyeOff,
  Award,
  Layers,
} from 'lucide-react';

export const AboutPrivacyScreen: React.FC = () => {
  return (
    <div className="space-y-5 pb-28 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          About &amp; Privacy
        </h1>
        <p className="text-xs text-slate-400">
          Strictly ad-free, offline-first, and privacy-respecting
        </p>
      </div>

      {/* 100% Ad-Free Guarantee Badge */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                100% Ad-Free Guarantee
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              NeoMusic is engineered as a clean, private audio environment. There are zero banner ads, zero interstitial popups, zero rewarded video interruptions, and absolutely no paid subscription paywalls.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>0 Banner Ads</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>0 Interstitials</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>0 Trackers/SDKs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>100% Offline</span>
          </div>
        </div>
      </div>

      {/* Android Background Playback Setup */}
      <div className="glass-panel p-5 rounded-3xl border border-white/15 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Android Background Playback Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Ensure uninterrupted 24/7 background audio playback
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                Disable Aggressive Battery Optimization
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </p>
              <p className="text-slate-400 mt-0.5">
                In Android <em>Settings &gt; Apps &gt; NeoMusic &gt; Battery</em>, select <strong>Unrestricted</strong>. This prevents system battery managers from freezing the media service during screen-off listening.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                Lock in Recent Apps (Optional)
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 mt-0.5">
                On customized Android skins, open Recent Apps and tap the <strong>Lock (🔒)</strong> icon on the NeoMusic card so "Clear All" will not terminate active playback.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                Grant Floating Overlay Permission
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </p>
              <p className="text-slate-400 mt-0.5">
                Enable <em>Display over other apps</em> if you wish to use the Dynamic Capsule while running other games and utilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="glass-panel p-5 rounded-3xl border border-white/15 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-300">
          Architecture &amp; Audio Framework
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Audio Pipeline</span>
            <span className="font-bold text-white mt-0.5 block">AndroidX Media3 ExoPlayer</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">UI Framework</span>
            <span className="font-bold text-white mt-0.5 block">Jetpack Compose &amp; Material 3</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Equalizer Engine</span>
            <span className="font-bold text-white mt-0.5 block">10-Band Biquad DSP</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Telemetry &amp; Tracking</span>
            <span className="font-bold text-white mt-0.5 block">Zero (0) Analytics</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-2">
          NeoMusic • Modern Private Audio Player
        </p>
      </div>
    </div>
  );
};
