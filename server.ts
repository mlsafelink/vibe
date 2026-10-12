import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health / Config check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey && apiKey.length > 5),
      supportedModels: {
        video: 'veo-3.1-fast-generate-preview',
        tts: 'gemini-3.8-flash-lite-tts',
        script: 'gemini-3.8-flash'
      }
    });
  });

  // 1. Generate Video with Veo 3 (veo-3.1-fast-generate-preview)
  app.post('/api/generate-video', async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY no está configurada en el servidor.' });
      }

      const { prompt, aspectRatio = '16:9', resolution = '720p' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Se requiere un prompt para generar el video.' });
      }

      const validAspectRatios = ['16:9', '9:16'];
      const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: resolution === '1080p' ? '1080p' : '720p',
          aspectRatio: chosenAspectRatio as '16:9' | '9:16',
        },
      });

      res.json({ operationName: operation.name });
    } catch (err: any) {
      console.error('Error starting video generation:', err);
      res.status(500).json({
        error: err?.message || 'Error al iniciar la generación del video con Veo 3.',
      });
    }
  });

  // 2. Poll Video Generation Status
  app.post('/api/video-status', async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY no disponible.' });
      }

      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: 'Se requiere operationName.' });
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error || null,
        name: updated.name,
      });
    } catch (err: any) {
      console.error('Error polling video status:', err);
      res.status(500).json({
        error: err?.message || 'Error al verificar el estado del video.',
      });
    }
  });

  // 3. Download Video
  app.post('/api/video-download', async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY no disponible.' });
      }

      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: 'Se requiere operationName.' });
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: 'URI de video no encontrada en la operación completada.' });
      }

      const videoRes = await fetch(uri, {
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({
          error: `Fallo al descargar video desde el origen (${videoRes.statusText})`,
        });
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'inline; filename="domotica-promo.mp4"');

      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Error downloading video:', err);
      res.status(500).json({
        error: err?.message || 'Error al descargar el video.',
      });
    }
  });

  // 4. Generate Masculine Voice-Over (TTS) with Gemini
  app.post('/api/generate-tts', async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY no disponible.' });
      }

      const { text, voiceName = 'Fenrir', style = 'Voz masculina persuasiva y entusiasta de comercial' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Se requiere el texto para la locución.' });
      }

      // Male prebuilt voices: 'Fenrir', 'Charon', 'Puck'
      const allowedVoices = ['Fenrir', 'Charon', 'Puck', 'Zephyr', 'Kore'];
      const chosenVoice = allowedVoices.includes(voiceName) ? voiceName : 'Fenrir';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(500).json({ error: 'No se generaron datos de audio.' });
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        voice: chosenVoice,
      });
    } catch (err: any) {
      console.error('Error generating TTS:', err);
      res.status(500).json({
        error: err?.message || 'Error al generar la locución de voz en off.',
      });
    }
  });

  // 5. Generate / Refine Commercial Script with Gemini
  app.post('/api/generate-script', async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY no disponible.' });
      }

      const {
        services = 'automatización de luces LED, TV racks iluminados y enchufes inteligentes',
        tone = 'moderno, tecnológico y persuasivo',
        durationSeconds = 20,
      } = req.body;

      const systemPrompt = `Eres un guionista publicitario y director creativo experto en domótica para el hogar y videos de Veo 3.
Tu objetivo es producir un guión comercial exacto para un video publicitario de aproximadamente ${durationSeconds} segundos con voz en off masculina en español, optimizado para conversión comercial.

Estructura requerida:
1. Escena 1 (0-6s): Living moderno con luces LEDs cálidas y frías integradas activándose suavemente.
2. Escena 2 (6-12s): TV rack flotante retroiluminado con sincronización dinámica ambiental creando atmósfera de cine.
3. Escena 3 (12-16s): Cocina con iluminación bajo mesada y enchufes inteligentes que controlan electrodomésticos y ahorran energía.
4. Escena 4 (16-20s): Cierre con llamado a la acción contundente: "Contáctanos y transforma tu hogar hoy mismo. Mejora tu comodidad y eficiencia energética."

Devuelve un JSON con:
- title: string
- voiceoverScript: string (el texto continuo exacto para la locución de ~20s)
- ctaText: string (llamado a la acción)
- veoPrompt: string (un prompt cinematográfico en inglés muy detallado para Veo 3 que capture perfectamente esta secuencia continua de iluminación domótica en el hogar)
- scenes: array de objetos { time: string, title: string, visualDescription: string, audioLine: string, icon: string }
- marketingTips: array de strings`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Genera el guión comercial de domótica básica enfocado en: ${services}. Tono: ${tone}. Duración: ${durationSeconds} segundos.`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating commercial script:', err);
      res.status(500).json({
        error: err?.message || 'Error al generar la propuesta de guión con IA.',
      });
    }
  });

  // Vite middleware setup
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DomoVibe Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
