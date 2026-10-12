import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { MaleVoice } from '../types';

interface ScriptEditorProps {
  script: string;
  onScriptChange: (newScript: string) => void;
  maleVoice: MaleVoice;
  onVoiceChange: (voice: MaleVoice) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  hasAudio: boolean;
  onOpenAiScriptModal: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onScriptChange,
  maleVoice,
  onVoiceChange,
  onGenerateAudio,
  isGeneratingAudio,
  hasAudio,
  onOpenAiScriptModal,
}) => {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  // Standard speech rate: ~2.5 words per second in Spanish for commercials
  const estimatedSeconds = Math.round(words / 2.5);

  const maleVoices: Array<{ id: MaleVoice; name: string; tag: string; desc: string }> = [
    {
      id: 'Fenrir',
      name: 'Fenrir',
      tag: 'Recomendada',
      desc: 'Masculina, enérgica, persuasiva y moderna para comerciales.',
    },
    {
      id: 'Charon',
      name: 'Charon',
      tag: 'Cálida',
      desc: 'Masculina profunda, serena y de alta gama para hogares premium.',
    },
    {
      id: 'Puck',
      name: 'Puck',
      tag: 'Dinámica',
      desc: 'Masculina ágil, cercana, amigable y conversacional.',
    },
  ];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Guión & Voz en Off Masculina</h3>
            <p className="text-xs text-slate-400">Locución profesional en español (~20 segundos)</p>
          </div>
        </div>

        <button
          onClick={onOpenAiScriptModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mejorar con IA</span>
        </button>
      </div>

      {/* Script Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label htmlFor="script-textarea" className="font-medium text-slate-300">
            Texto para la locución
          </label>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>~{estimatedSeconds}s estimados</span>
            </span>
            <span className={`font-mono ${words >= 35 && words <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {words} palabras
            </span>
          </div>
        </div>
        <textarea
          id="script-textarea"
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all resize-y"
          placeholder="Escribe el guión comercial de 20 segundos..."
        />
        <p className="text-[11px] text-slate-400">
          Tip: Entre 40 y 55 palabras es el ritmo ideal para un anuncio comercial de 20 segundos.
        </p>
      </div>

      {/* Voice Selection Cards */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-300 block">
          Seleccionar Voz Masculina (Gemini TTS)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {maleVoices.map((v) => {
            const isSelected = maleVoice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onVoiceChange(v.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/70 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {v.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {v.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{v.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Voice Action Button */}
      <div className="pt-2 flex items-center justify-between">
        {hasAudio ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4" />
            Locución generada y sincronizada
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Genera el audio WAV para reproducirlo junto al video
          </span>
        )}

        <button
          onClick={onGenerateAudio}
          disabled={isGeneratingAudio || !script.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAudio ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sintetizando Voz...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>{hasAudio ? 'Regenerar Locución' : 'Generar Locución'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
