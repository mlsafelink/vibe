import React from 'react';
import { Scene } from '../types';
import { Lightbulb, Tv, Zap, PhoneCall, Clock } from 'lucide-react';

interface SceneListEditorProps {
  scenes: Scene[];
  onSceneChange: (index: number, updatedScene: Scene) => void;
  activeSec: number;
}

export const SceneListEditor: React.FC<SceneListEditorProps> = ({
  scenes,
  onSceneChange,
  activeSec,
}) => {
  const getSceneIcon = (type: Scene['deviceType']) => {
    switch (type) {
      case 'led_living':
        return <Lightbulb className="w-4 h-4 text-sky-400" />;
      case 'tv_rack':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'smart_plug':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'cta_card':
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Desglose de Escenas (20 Segundos)</h3>
        <p className="text-xs text-slate-400">
          Estructura cronológica del comercial publicitario de domótica básica
        </p>
      </div>

      <div className="space-y-3">
        {scenes.map((scene, idx) => {
          const isCurrentlyActive = activeSec >= scene.startSec && activeSec < scene.endSec;

          return (
            <div
              key={scene.id}
              className={`p-4 rounded-xl border transition-all ${
                isCurrentlyActive
                  ? 'bg-blue-950/30 border-blue-500/60 shadow-sm'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getSceneIcon(scene.deviceType)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      Escena {idx + 1}: {scene.title}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 ml-2">
                      [{scene.timeRange}]
                    </span>
                  </div>
                </div>

                {isCurrentlyActive && (
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 animate-pulse">
                    En pantalla
                  </span>
                )}
              </div>

              {/* Visual description */}
              <div className="mb-2">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Descripción Visual
                </span>
                <input
                  type="text"
                  value={scene.visualPrompt}
                  onChange={(e) =>
                    onSceneChange(idx, { ...scene, visualPrompt: e.target.value })
                  }
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
                />
              </div>

              {/* Voice line */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Frase de Locución
                </span>
                <input
                  type="text"
                  value={scene.audioLine}
                  onChange={(e) =>
                    onSceneChange(idx, { ...scene, audioLine: e.target.value })
                  }
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
