import React, { useState } from 'react';
import { Sparkles, Wand2, X, RefreshCw, Check } from 'lucide-react';

interface ScriptAIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (data: {
    script: string;
    veoPrompt: string;
    ctaText: string;
  }) => void;
}

export const ScriptAIGeneratorModal: React.FC<ScriptAIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyScript,
}) => {
  const [tone, setTone] = useState<string>('moderno, dinámico y persuasivo');
  const [services, setServices] = useState<string>(
    'automatización de luces LED en living, TV racks iluminados y enchufes inteligentes en cocina'
  );
  const [duration, setDuration] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services,
          tone,
          durationSeconds: duration,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Fallo al comunicarse con Gemini');
      }

      const data = await res.json();
      setGeneratedResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error al generar el guión publicitario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedResult) {
      onApplyScript({
        script: generatedResult.voiceoverScript || '',
        veoPrompt: generatedResult.veoPrompt || '',
        ctaText: generatedResult.ctaText || '',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Generador de Guión Publicitario con Gemini
            </h3>
            <p className="text-xs text-slate-400">
              Crea variaciones de guión y prompts para Veo 3 con IA
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Servicios de Domótica a Destacar
            </label>
            <textarea
              rows={2}
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Tono Comercial
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="moderno, dinámico y persuasivo">Moderno y Dinámico</option>
                <option value="elegante, premium y sofisticado">Elegante y Premium</option>
                <option value="cercano, confiable y accesible">Cercano y Accesible</option>
                <option value="enfocado en ahorro energético y confort">Ahorro y Confort</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Duración Objetivo
              </label>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-400 font-mono">
                {duration} segundos (Comercial Estándar)
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Escribiendo con Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generar Nueva Propuesta de Guión</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">
                  Locución Generada:
                </span>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{generatedResult.voiceoverScript}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 block mb-0.5">
                  Prompt Veo 3 sugerido:
                </span>
                <p className="text-[11px] text-slate-400 font-mono line-clamp-3">
                  {generatedResult.veoPrompt}
                </p>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar al Proyecto Actual</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
