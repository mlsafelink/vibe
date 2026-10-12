import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Share2,
  Sparkles,
  Layers,
  CheckCircle,
  Eye,
  Tv
} from 'lucide-react';
import { VideoProject } from '../types';
import { InteractiveSceneVisualizer } from './InteractiveSceneVisualizer';

interface VideoPlayerProps {
  project: VideoProject;
  videoUrl: string | null;
  audioUrl: string | null;
  onOpenVeoGenerate: () => void;
  onOpenTtsGenerate: () => void;
  isGenerating: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  videoUrl,
  audioUrl,
  onOpenVeoGenerate,
  onOpenTtsGenerate,
  isGenerating,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // If there is no real video yet, default to interactive preview tab so user sees something dynamic immediately
  useEffect(() => {
    if (!videoUrl) {
      setActiveTab('interactive');
    } else {
      setActiveTab('video');
    }
  }, [videoUrl]);

  // Sync simulated playback when using interactive mode or timer
  useEffect(() => {
    if (isPlaying && (!videoUrl || activeTab === 'interactive')) {
      const interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
      timerRef.current = interval;
      return () => clearInterval(interval);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [isPlaying, videoUrl, activeTab, duration]);

  // Video element events
  const handleTimeUpdate = () => {
    if (videoRef.current && activeTab === 'video') {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (activeTab === 'video' && videoRef.current) {
      if (nextPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }

    if (audioRef.current && audioUrl) {
      if (nextPlay) {
        audioRef.current.currentTime = currentTime;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleReset = () => {
    handleSeek(0);
    if (isPlaying) {
      togglePlay();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Find active subtitle/scene
  const currentScene = project.scenes.find(
    (s) => currentTime >= s.startSec && currentTime <= s.endSec
  ) || project.scenes[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `domotica-promo-${project.aspectRatio}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `domotica-locucion-masculina-${project.maleVoice}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isVertical = project.aspectRatio === '9:16';

  return (
    <div className="flex flex-col gap-4">
      {/* Player Frame Header with format indicator and tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          {/* View Modes */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Video Veo 3</span>
              {videoUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'interactive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simulador de Escenas</span>
            </button>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {project.aspectRatio} • {project.resolution}
          </span>
        </div>

        {/* Audio Track Badge */}
        <div className="flex items-center gap-2">
          {audioUrl ? (
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Locución Masculina ({project.maleVoice}) Lista</span>
            </div>
          ) : (
            <button
              onClick={onOpenTtsGenerate}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generar Locución</span>
            </button>
          )}

          {videoUrl && (
            <button
              onClick={handleDownloadVideo}
              title="Descargar Video MP4"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className={`relative w-full mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col items-center justify-center ${
          isVertical ? 'max-w-sm aspect-[9/16]' : 'aspect-video'
        }`}
      >
        {/* Render Real Video if in video mode and URL exists */}
        {activeTab === 'video' && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            playsInline
          />
        ) : activeTab === 'interactive' || !videoUrl ? (
          /* Interactive Storyboard Simulator */
          <div className="w-full h-full">
            <InteractiveSceneVisualizer
              currentSec={currentTime}
              scenes={project.scenes}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              aspectRatio={project.aspectRatio}
            />

            {/* If video tab was chosen but no video is generated yet, show prompt banner */}
            {activeTab === 'video' && !videoUrl && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Video con Veo 3 Listo para Generar
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                  Genera la renderización fotorrealista de 20 segundos con el modelo{' '}
                  <span className="font-mono text-cyan-400 bg-cyan-950/50 px-1 py-0.5 rounded">
                    veo-3.1-fast-generate-preview
                  </span>{' '}
                  mostrando el living con luces LED, el TV rack iluminado y la cocina con enchufes inteligentes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={onOpenVeoGenerate}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Video con Veo 3</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('interactive')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  >
                    Ver Simulador Interactivo
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Audio Element for Synchronized Masculine Voice-over */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            onEnded={() => {
              if (activeTab === 'interactive' && !videoUrl) {
                setIsPlaying(false);
              }
            }}
          />
        )}

        {/* OVERLAYS: Top Watermark & Business Logo */}
        {project.branding.showWatermark && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              {project.branding.businessName}
            </span>
          </div>
        )}

        {/* OVERLAYS: Top-Right Contact Badge */}
        {project.branding.showContactBadge && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none bg-blue-600/90 text-white backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold shadow-lg border border-blue-400/40">
            {project.branding.phoneOrWhatsapp}
          </div>
        )}

        {/* OVERLAYS: Subtitles / Lower Third Caption Box */}
        {project.branding.showCaptions && (
          <div className="absolute bottom-16 inset-x-4 z-20 pointer-events-none flex justify-center">
            <div className="max-w-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-2xl text-center transition-all duration-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                {currentScene.title}
              </span>
              <p className="text-xs sm:text-sm font-medium text-white leading-snug drop-shadow-md">
                "{currentScene.audioLine}"
              </p>
            </div>
          </div>
        )}

        {/* Quick Play Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Reproducir video"
            className="absolute z-20 w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 min-w-14">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group">
            <input
              type="range"
              min="0"
              max={duration || 20}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
            {/* Progress Fill bar */}
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-lg pointer-events-none"
              style={{ width: `${(currentTime / (duration || 20)) * 100}%` }}
            />
          </div>

          <span className="text-xs font-mono text-slate-400 min-w-14 text-right">
            {formatTime(duration || 20)}
          </span>
        </div>

        {/* Buttons and volume controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all shadow-md shadow-blue-600/25"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-800">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Quick Scene Jump */}
          <div className="flex items-center gap-1.5">
            {audioUrl && (
              <button
                onClick={handleDownloadAudio}
                className="hidden sm:flex items-center gap-1 text-xs text-slate-300 hover:text-cyan-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl transition-colors border border-slate-700"
                title="Descargar Locución WAV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Audio WAV</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Pantalla Completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
