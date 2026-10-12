/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { PromptEditor } from './components/PromptEditor';
import { ScriptEditor } from './components/ScriptEditor';
import { SceneListEditor } from './components/SceneListEditor';
import { BrandSettings } from './components/BrandSettings';
import { GenerationModal } from './components/GenerationModal';
import { ScriptAIGeneratorModal } from './components/ScriptAIGeneratorModal';
import {
  DEFAULT_DOMOTICA_PROJECT,
  ALTERNATIVE_TEMPLATES,
} from './data/templates';
import {
  VideoProject,
  GenerationStatus,
  AspectRatio,
  Resolution,
  MaleVoice,
  Scene,
} from './types';
import {
  Sparkles,
  Layout,
  Tv,
  Layers,
  Palette,
  Volume2,
  Video as VideoIcon,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<VideoProject>(DEFAULT_DOMOTICA_PROJECT);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'scenes' | 'brand' | 'templates'>('editor');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);

  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    stage: 'idle',
    progress: 0,
    message: '',
  });

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .catch((err) => console.log('Backend status check:', err));
  }, []);

  // Handler: Generate Masculine Voiceover (Gemini TTS)
  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setStatus({
      isGenerating: true,
      stage: 'generating_tts',
      progress: 30,
      message: `Generando voz en off masculina (${project.maleVoice}) con Gemini TTS...`,
    });

    try {
      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: project.voiceoverScript,
          voiceName: project.maleVoice,
          style: 'Voz masculina persuasiva y entusiasta para comercial de domótica de 20 segundos',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Fallo al sintetizar voz.');
      }

      const data = await res.json();
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);

      setStatus({
        isGenerating: false,
        stage: 'done',
        progress: 100,
        message: '¡Locución generada con éxito!',
      });
    } catch (err: any) {
      console.error('TTS error:', err);
      setStatus({
        isGenerating: false,
        stage: 'error',
        progress: 0,
        message: 'Error al generar locución.',
        error: err?.message || 'No se pudo conectar con el servicio de voz.',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Handler: Generate Video with Veo 3 (veo-3.1-fast-generate-preview)
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setStatus({
      isGenerating: true,
      stage: 'starting',
      progress: 10,
      message: 'Iniciando pipeline de video con Veo 3 (veo-3.1-fast-generate-preview)...',
    });

    try {
      // 1. Start generation operation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: project.veoPrompt,
          aspectRatio: project.aspectRatio,
          resolution: project.resolution,
        }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Fallo al iniciar generación con Veo 3.');
      }

      const { operationName } = await startRes.json();
      setStatus({
        isGenerating: true,
        stage: 'rendering_veo',
        progress: 25,
        message: 'Veo 3 está renderizando las escenas de luces LED y domótica... Esto puede demorar 1-2 minutos.',
        operationName,
      });

      // 2. Poll until completed
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // Up to ~5-10 minutes

      while (!isDone && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 8000));
        attempts++;

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        if (statusData.error) {
          throw new Error(statusData.error.message || 'Error reportado por Veo 3');
        }

        if (statusData.done) {
          isDone = true;
          break;
        } else {
          const estimatedProgress = Math.min(25 + attempts * 5, 88);
          setStatus((prev) => ({
            ...prev,
            progress: estimatedProgress,
            message: `Veo 3 procesando fotogramas fotorrealistas (${Math.round(estimatedProgress)}%)...`,
          }));
        }
      }

      if (!isDone) {
        throw new Error('La generación tardó más de lo esperado. Por favor reintenta.');
      }

      // 3. Download generated MP4 video
      setStatus({
        isGenerating: true,
        stage: 'processing',
        progress: 92,
        message: 'Descargando y preparando el archivo de video final...',
      });

      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('No se pudo descargar el video renderizado.');
      }

      const videoBlob = await downloadRes.blob();
      const newVideoUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(newVideoUrl);

      setStatus({
        isGenerating: false,
        stage: 'done',
        progress: 100,
        message: '¡Video de Veo 3 generado y listo para reproducir!',
      });
    } catch (err: any) {
      console.error('Video generation error:', err);
      setStatus({
        isGenerating: false,
        stage: 'error',
        progress: 0,
        message: 'Error durante la generación de video con Veo 3.',
        error: err?.message || 'Error inesperado al conectar con Veo 3.',
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handler: Generate Full Commercial (Video + Audio in unison)
  const handleGenerateAll = async () => {
    // Generate audio first or concurrently
    handleGenerateAudio();
    handleGenerateVideo();
  };

  // Handler: Select Template
  const handleSelectTemplate = (template: (typeof ALTERNATIVE_TEMPLATES)[0]) => {
    setProject((prev) => ({
      ...prev,
      aspectRatio: template.aspectRatio,
      veoPrompt: template.veoPrompt,
      voiceoverScript: template.voiceoverScript,
    }));
    setActiveTab('editor');
  };

  // Handler: Update Scene
  const handleUpdateScene = (idx: number, updatedScene: Scene) => {
    setProject((prev) => {
      const nextScenes = [...prev.scenes];
      nextScenes[idx] = updatedScene;
      return { ...prev, scenes: nextScenes };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        onGenerateAll={handleGenerateAll}
        isGenerating={isGeneratingVideo || isGeneratingAudio}
        hasGeneratedVideo={Boolean(videoUrl)}
        hasGeneratedAudio={Boolean(audioUrl)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Hero Brief Alert */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-cyan-950/40 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Comercial de Domótica Básica (20 Segundos)
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-0.5">
                Living con luces LED sincronizadas, rack de TV iluminado, cocina con dispositivos y enchufes inteligentes, locución masculina persuasiva y llamado a la acción final para transformar hogares hoy mismo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('templates')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Plantillas 16:9 / 9:16
            </button>
            <button
              onClick={handleGenerateAll}
              disabled={isGeneratingVideo || isGeneratingAudio}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Todo</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace: Split Player & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Video Player & Storyboard Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <VideoPlayer
              project={project}
              videoUrl={videoUrl}
              audioUrl={audioUrl}
              onOpenVeoGenerate={handleGenerateVideo}
              onOpenTtsGenerate={handleGenerateAudio}
              isGenerating={isGeneratingVideo}
            />

            {/* Quick Helper Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Puedes reproducir la locución masculina en el simulador o con el video generado de Veo 3.
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                {project.aspectRatio} • {project.duration}s
              </span>
            </div>
          </div>

          {/* Right Column: Customization Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tabs Navigation */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video & Voz</span>
              </button>

              <button
                onClick={() => setActiveTab('scenes')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'scenes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Escenas (20s)</span>
              </button>

              <button
                onClick={() => setActiveTab('brand')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'brand'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Marca</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'templates'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Formatos</span>
              </button>
            </div>

            {/* TAB CONTENT 1: Prompt & Script Editor */}
            {activeTab === 'editor' && (
              <div className="space-y-4">
                <PromptEditor
                  prompt={project.veoPrompt}
                  onPromptChange={(p) => setProject({ ...project, veoPrompt: p })}
                  aspectRatio={project.aspectRatio}
                  onAspectRatioChange={(r) => setProject({ ...project, aspectRatio: r })}
                  resolution={project.resolution}
                  onResolutionChange={(res) => setProject({ ...project, resolution: res })}
                  onGenerateVideo={handleGenerateVideo}
                  isGeneratingVideo={isGeneratingVideo}
                />

                <ScriptEditor
                  script={project.voiceoverScript}
                  onScriptChange={(s) => setProject({ ...project, voiceoverScript: s })}
                  maleVoice={project.maleVoice}
                  onVoiceChange={(v) => setProject({ ...project, maleVoice: v })}
                  onGenerateAudio={handleGenerateAudio}
                  isGeneratingAudio={isGeneratingAudio}
                  hasAudio={Boolean(audioUrl)}
                  onOpenAiScriptModal={() => setIsScriptModalOpen(true)}
                />
              </div>
            )}

            {/* TAB CONTENT 2: 4 Scenes Breakdown */}
            {activeTab === 'scenes' && (
              <SceneListEditor
                scenes={project.scenes}
                onSceneChange={handleUpdateScene}
                activeSec={0}
              />
            )}

            {/* TAB CONTENT 3: Brand & Overlay Settings */}
            {activeTab === 'brand' && (
              <BrandSettings
                branding={project.branding}
                onBrandingChange={(b) => setProject({ ...project, branding: b })}
              />
            )}

            {/* TAB CONTENT 4: Alternative Formats & Templates */}
            {activeTab === 'templates' && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Formatos & Plantillas de Anuncio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona una configuración optimizada para tu canal de distribución
                  </p>
                </div>

                <div className="space-y-3">
                  {ALTERNATIVE_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-100">{tpl.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{tpl.description}</p>
                      </div>

                      <button
                        onClick={() => handleSelectTemplate(tpl)}
                        className="self-end px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all"
                      >
                        Cargar Formato
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Generation Status Progress Modal */}
      <GenerationModal
        status={status}
        onClose={() => setStatus((prev) => ({ ...prev, isGenerating: false, stage: 'idle' }))}
        aspectRatio={project.aspectRatio}
      />

      {/* Script AI Generator Modal */}
      <ScriptAIGeneratorModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        onApplyScript={({ script, veoPrompt, ctaText }) => {
          setProject((prev) => ({
            ...prev,
            voiceoverScript: script || prev.voiceoverScript,
            veoPrompt: veoPrompt || prev.veoPrompt,
            branding: {
              ...prev.branding,
              ctaMessage: ctaText || prev.branding.ctaMessage,
            },
          }));
        }}
      />
    </div>
  );
}
