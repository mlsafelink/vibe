import React from 'react';
import { Sparkles, Video, Mic, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { GenerationStatus } from '../types';

interface GenerationModalProps {
  status: GenerationStatus;
  onClose: () => void;
  aspectRatio: string;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  status,
  onClose,
  aspectRatio,
}) => {
  if (!status.isGenerating && status.stage === 'idle') return null;

  const steps = [
    {
      id: 'starting',
      label: 'Preparando Escenas & Prompt Cinematográfico',
      desc: 'Formateando instrucciones para el modelo Veo 3',
    },
    {
      id: 'rendering_veo',
      label: 'Generando Video con Veo 3 (veo-3.1-fast-generate-preview)',
      desc: `Renderizando living con luces LED, TV rack y cocina (${aspectRatio})`,
    },
    {
      id: 'generating_tts',
      label: 'Generando Locución Masculina con IA',
      desc: 'Síntesis de voz publicitaria en español con Gemini TTS',
    },
    {
      id: 'processing',
      label: 'Sincronizando Video & Audio',
      desc: 'Ensamblando subtítulos y pistas para reproducción',
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (status.stage === 'error') return 'error';
    if (status.stage === 'done') return 'done';

    const order = ['starting', 'rendering_veo', 'generating_tts', 'processing', 'done'];
    const currentIdx = order.indexOf(status.stage);
    const stepIdx = order.indexOf(stepId);

    if (currentIdx > stepIdx) return 'done';
    if (currentIdx === stepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button if finished or error */}
        {(status.stage === 'done' || status.stage === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {status.stage === 'error' ? (
                <AlertCircle className="w-6 h-6 text-rose-400" />
              ) : status.stage === 'done' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {status.stage === 'error'
                ? 'Error en la Generación'
                : status.stage === 'done'
                ? '¡Anuncio Publicitario Listo!'
                : 'Produciendo Video de Domótica'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Modelo: veo-3.1-fast-generate-preview
            </p>
          </div>
        </div>

        {/* Progress message banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{status.message}</span>
        </div>

        {/* Step-by-Step progress tracker */}
        <div className="space-y-3 mb-6">
          {steps.map((step) => {
            const stepState = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  stepState === 'active'
                    ? 'bg-blue-950/40 border-blue-500/50 text-white'
                    : stepState === 'done'
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {stepState === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {stepState === 'active' && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  {stepState === 'pending' && (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{step.label}</div>
                  <div className="text-[11px] text-slate-400">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassuring tips during video generation */}
        {status.isGenerating && (
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-[11px] text-slate-300">
            <span className="font-semibold text-blue-400 block mb-0.5">
              💡 Consejo Publicitario:
            </span>
            Los videos comerciales con transiciones de luz cálida a fría y tomas de racks de TV tienen un 40% más de retención en Instagram Reels y TikTok.
          </div>
        )}

        {/* Error message detail */}
        {status.error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
            {status.error}
          </div>
        )}

        {/* Action Button */}
        {(status.stage === 'done' || status.stage === 'error') && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              {status.stage === 'done' ? 'Ver Video en Estudio' : 'Cerrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
