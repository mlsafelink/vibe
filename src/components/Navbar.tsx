import React from 'react';
import { Sparkles, Video, Mic, ShieldCheck, Home } from 'lucide-react';

interface NavbarProps {
  onGenerateAll: () => void;
  isGenerating: boolean;
  hasGeneratedVideo: boolean;
  hasGeneratedAudio: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGenerateAll,
  isGenerating,
  hasGeneratedVideo,
  hasGeneratedAudio,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Home className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">DomoVibe</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Veo 3 Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Creador de Videos para Domótica Básica del Hogar
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-3">
          {/* Tech Badges */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-[11px] text-slate-300">veo-3.1-fast-generate-preview</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">Voz Masculina</span>
            </span>
          </div>

          {/* Quick status dots */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            {hasGeneratedVideo && (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" /> Video Listo
              </span>
            )}
            {hasGeneratedAudio && (
              <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" /> Audio Listo
              </span>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onGenerateAll}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>{isGenerating ? 'Generando...' : 'Generar Video & Voz (20s)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
