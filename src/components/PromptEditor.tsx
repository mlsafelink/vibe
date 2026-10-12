import React from 'react';
import { Video, Sparkles, Smartphone, Monitor, Wand2, RefreshCw } from 'lucide-react';
import { AspectRatio, Resolution } from '../types';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  resolution: Resolution;
  onResolutionChange: (res: Resolution) => void;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  onGenerateVideo,
  isGeneratingVideo,
}) => {
  const quickTags = [
    'Living con luces LED perimetrales cálidas',
    'Rack de TV con retroiluminación ambiente',
    'Cocina con tiras LED bajo mesada',
    'Enchufes inteligentes con indicador de estado',
    'Cinematografía 4K fotorrealista 20s',
    'Cámara lenta elegante',
  ];

  const handleAppendTag = (tag: string) => {
    if (prompt.includes(tag)) return;
    onPromptChange(prompt ? `${prompt}, ${tag}` : tag);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Generación de Video con Veo 3</h3>
              <span className="font-mono text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">
                veo-3.1-fast-generate-preview
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prompt cinemático y formato de pantalla
            </p>
          </div>
        </div>
      </div>

      {/* Aspect Ratio and Resolution Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Aspect Ratio (Required 16:9 or 9:16) */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Relación de Aspecto (Aspect Ratio)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAspectRatioChange('16:9')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold block">16:9 Horizontal</span>
                <span className="text-[10px] text-slate-400 block">YouTube / Web</span>
              </div>
            </button>

            <button
              onClick={() => onAspectRatioChange('9:16')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold block">9:16 Vertical</span>
                <span className="text-[10px] text-slate-400 block">Reels / TikTok</span>
              </div>
            </button>
          </div>
        </div>

        {/* Resolution */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Resolución de Renderizado
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onResolutionChange('720p')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                resolution === '720p'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block">720p HD</span>
              <span className="text-[10px] text-slate-400 block">Más rápido</span>
            </button>

            <button
              onClick={() => onResolutionChange('1080p')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                resolution === '1080p'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block">1080p Full HD</span>
              <span className="text-[10px] text-slate-400 block">Máxima nitidez</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prompt Textarea */}
      <div className="space-y-1.5">
        <label htmlFor="veo-prompt-textarea" className="text-xs font-medium text-slate-300 block">
          Prompt Cinematográfico para Veo 3
        </label>
        <textarea
          id="veo-prompt-textarea"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all resize-y font-mono"
          placeholder="Escribe la descripción de las escenas para Veo 3..."
        />
      </div>

      {/* Cinematography Quick Tag Helpers */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
          Etiquetas Rápidas de Iluminación & Domótica:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleAppendTag(tag)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Duración: 20 segundos • Aspect Ratio: {aspectRatio}
        </span>

        <button
          onClick={onGenerateVideo}
          disabled={isGeneratingVideo || !prompt.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingVideo ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Renderizando con Veo 3...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Video con Veo 3</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
