import React, { useState } from 'react';
import { Scene } from '../types';
import { Tv, Zap, PhoneCall, Lightbulb, Play, Pause, Sparkles } from 'lucide-react';

interface InteractiveSceneVisualizerProps {
  currentSec: number;
  scenes: Scene[];
  isPlaying: boolean;
  onSeek: (sec: number) => void;
  aspectRatio: '16:9' | '9:16';
}

export const InteractiveSceneVisualizer: React.FC<InteractiveSceneVisualizerProps> = ({
  currentSec,
  scenes,
  onSeek,
  aspectRatio,
}) => {
  // Interactive smart device state in simulator
  const [activeLedHue, setActiveLedHue] = useState<'cyan' | 'amber' | 'purple' | 'emerald'>('cyan');
  const [smartPlugOn, setSmartPlugOn] = useState<boolean>(true);
  const [tvBacklightOn, setTvBacklightOn] = useState<boolean>(true);

  // Active scene based on timestamp
  const activeSceneIndex = scenes.findIndex(
    (s) => currentSec >= s.startSec && currentSec < s.endSec
  );
  const currentScene = activeSceneIndex !== -1 ? scenes[activeSceneIndex] : scenes[0];

  const getGlowColor = () => {
    switch (activeLedHue) {
      case 'cyan':
        return 'rgba(56, 189, 248, 0.45)';
      case 'amber':
        return 'rgba(245, 158, 11, 0.45)';
      case 'purple':
        return 'rgba(168, 85, 247, 0.45)';
      case 'emerald':
        return 'rgba(16, 185, 129, 0.45)';
      default:
        return 'rgba(56, 189, 248, 0.45)';
    }
  };

  const getHexGlow = () => {
    switch (activeLedHue) {
      case 'cyan':
        return '#38bdf8';
      case 'amber':
        return '#f59e0b';
      case 'purple':
        return '#a855f7';
      case 'emerald':
        return '#10b981';
      default:
        return '#38bdf8';
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Room Atmosphere with dynamic ambient LED shadows */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${getGlowColor()} 0%, rgba(15, 23, 42, 0.95) 75%)`,
        }}
      />

      {/* Top Scene Tracker Tag */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900/80 text-cyan-400 border border-slate-700/60 backdrop-blur-sm">
            {currentScene.timeRange}
          </span>
          <span className="text-xs font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
            {currentScene.title}
          </span>
        </div>

        {/* Ambient Color Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 backdrop-blur-sm">
          <button
            onClick={() => setActiveLedHue('cyan')}
            title="Azul Cine"
            className={`w-4 h-4 rounded-full bg-sky-400 transition-transform ${activeLedHue === 'cyan' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`}
          />
          <button
            onClick={() => setActiveLedHue('amber')}
            title="Ámbar Cálido"
            className={`w-4 h-4 rounded-full bg-amber-400 transition-transform ${activeLedHue === 'amber' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`}
          />
          <button
            onClick={() => setActiveLedHue('purple')}
            title="Púrpura Neón"
            className={`w-4 h-4 rounded-full bg-purple-500 transition-transform ${activeLedHue === 'purple' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`}
          />
          <button
            onClick={() => setActiveLedHue('emerald')}
            title="Verde Esmeralda"
            className={`w-4 h-4 rounded-full bg-emerald-400 transition-transform ${activeLedHue === 'emerald' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`}
          />
        </div>
      </div>

      {/* Middle Interactive Simulation Graphics */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        {/* SCENE 1: Living Room Cove LED */}
        {currentScene.deviceType === 'led_living' && (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Ceiling Cove LED Strip Graphic */}
            <div
              className="w-full h-4 rounded-full transition-all duration-700 shadow-lg"
              style={{
                backgroundColor: getHexGlow(),
                boxShadow: `0 0 25px 8px ${getGlowColor()}`,
              }}
            />

            <div className="w-full mt-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-200">
                    Iluminación LED Cielorraso & Molduras
                  </span>
                </div>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Dimmer 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tiras LED COB sin puntos visibles, encendido gradual y escenas personalizadas para descanso o recepción.
              </p>
            </div>
          </div>
        )}

        {/* SCENE 2: TV Floating Rack with Backlight */}
        {currentScene.deviceType === 'tv_rack' && (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* TV Screen Mockup with Backlight Glow */}
            <div className="relative w-64 sm:w-72 h-36 rounded-xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center transition-all duration-500">
              {/* Backlight Halo */}
              {tvBacklightOn && (
                <div
                  className="absolute -inset-3 rounded-2xl -z-10 blur-xl transition-all duration-500"
                  style={{
                    backgroundColor: getHexGlow(),
                    opacity: 0.85,
                  }}
                />
              )}

              {/* TV Screen Content */}
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <Tv className="w-8 h-8 text-slate-300" />
                <span className="text-[11px] font-semibold text-slate-200 tracking-wide uppercase">
                  Rack Flotante Con Ambilight
                </span>
                <span className="text-[10px] text-slate-400">
                  Luz ambiental sincronizada
                </span>
              </div>

              {/* Floating Rack Shelf Below */}
              <div
                className="absolute -bottom-6 w-4/5 h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: tvBacklightOn ? getHexGlow() : '#334155',
                  boxShadow: tvBacklightOn ? `0 0 16px 4px ${getGlowColor()}` : 'none',
                }}
              />
            </div>

            {/* Toggle TV Rack Light */}
            <button
              onClick={() => setTvBacklightOn(!tvBacklightOn)}
              className="mt-10 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{tvBacklightOn ? 'Apagar LED Trasero' : 'Encender LED Trasero'}</span>
            </button>
          </div>
        )}

        {/* SCENE 3: Smart Kitchen Plugs & Under-cabinet */}
        {currentScene.deviceType === 'smart_plug' && (
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="w-full p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Enchufe Inteligente Wi-Fi</h4>
                    <p className="text-xs text-slate-400">Control de cafetera & electrodomésticos</p>
                  </div>
                </div>

                {/* Interactive Plug Switch */}
                <button
                  onClick={() => setSmartPlugOn(!smartPlugOn)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                    smartPlugOn ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Status Display */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Estado</span>
                  <span className={`font-semibold ${smartPlugOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {smartPlugOn ? '● Conectado (ON)' : '○ Apagado (OFF)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Consumo Activo</span>
                  <span className="font-semibold text-cyan-400 font-mono">
                    {smartPlugOn ? '145 Watts' : '0.2 Watts (Standby)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 4: CTA Call to action */}
        {currentScene.deviceType === 'cta_card' && (
          <div className="w-full max-w-md text-center p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-blue-950/40 border border-blue-500/30 backdrop-blur-md shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center mb-3">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              ¡Transforma Tu Hogar Hoy Mismo!
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Instalación rápida de domótica básica. Luces LED inteligentes, enchufes y confort total.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/30">
              <span>Asesoramiento Sin Cargo</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Scene Timeline Pills */}
      <div className="relative z-10 p-3 bg-slate-950/90 border-t border-slate-800/80">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {scenes.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => onSeek(scene.startSec)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                  <span className="font-semibold text-blue-400">0{idx + 1}</span>
                  <span>{scene.startSec}s</span>
                </div>
                <div className="text-[11px] font-medium truncate">
                  {scene.title.split(' ')[0]} {scene.title.split(' ')[1] || ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
