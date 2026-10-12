import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Copy,
  Check,
  FolderTree,
  Terminal,
  ExternalLink,
  Smartphone,
  Cpu,
  Layers,
  Cloud,
} from 'lucide-react';
import {
  ANDROID_PROJECT_FILES,
  downloadAndroidProjectZip,
  AndroidFileDefinition,
} from '../../services/androidProjectGenerator';

export const AndroidExportScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileDefinition>(
    ANDROID_PROJECT_FILES.find((f) => f.path.includes('MusicPlaybackService')) ||
      ANDROID_PROJECT_FILES[3]
  );
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Native Android Source Project
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Android Studio Ready
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Complete Kotlin, Media3 ExoPlayer, Jetpack Compose, &amp; Gradle codebase
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Bundling ZIP...' : 'Download Project (.ZIP)'}
        </button>
      </div>

      {/* Two build options: Local Android Studio & Free GitHub Actions Cloud Build */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Local Android Studio */}
        <div className="glass-panel p-4 rounded-3xl border border-white/15 bg-slate-950/70 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono text-cyan-300">
            <Terminal className="w-4 h-4" />
            1. Local Android Studio Build
          </h3>
          <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
            <li>Extract the downloaded <code className="text-cyan-300 bg-white/5 px-1 rounded">NeoMusic-Android-Project.zip</code>.</li>
            <li>In Android Studio, select <strong>File &gt; Open</strong> and choose the folder.</li>
            <li>Connect your Android phone with <strong>USB Debugging</strong> enabled.</li>
            <li>Click <strong>Run (▶)</strong> (<kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[9px]">Shift+F10</kbd>) to compile and install debug APK.</li>
          </ol>
        </div>

        {/* Option 2: Free GitHub Actions Cloud Build */}
        <div className="glass-panel p-4 rounded-3xl border border-white/15 bg-slate-950/70 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono text-emerald-300">
            <Cloud className="w-4 h-4" />
            2. Free Cloud Build (GitHub Actions)
          </h3>
          <p className="text-xs text-slate-400">
            No local Android SDK or high-spec PC needed:
          </p>
          <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
            <li>Push the project files to your GitHub repository.</li>
            <li>The included <code className="text-emerald-300 bg-white/5 px-1 rounded">.github/workflows/build-apk.yml</code> workflow runs automatically.</li>
            <li>Go to the <strong>Actions</strong> tab on GitHub and download the ready-to-install <code className="text-white font-mono text-[10px]">app-debug.apk</code> from Artifacts!</li>
          </ol>
        </div>
      </div>

      {/* Interactive Code Explorer */}
      <div className="glass-panel rounded-3xl border border-white/15 overflow-hidden flex flex-col md:flex-row min-h-[460px]">
        {/* Left file tree */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-3 bg-black/30 flex flex-col">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-300 mb-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>Project Files ({ANDROID_PROJECT_FILES.length})</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-48 md:max-h-[400px]">
            {ANDROID_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const fileName = file.path.split('/').pop() || file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 truncate ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right code viewer */}
        <div className="flex-1 flex flex-col bg-[#080a0f] min-w-0">
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-slate-900/50">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-mono font-bold text-white truncate block">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[380px] leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-200">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
