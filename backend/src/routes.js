

import { Router } from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { buildPrompt } from './prompts.js';

const MODEL_ID = 'gemini-2.5-flash-image';

export function createRouter({ apiKey }) {
  const ai = new GoogleGenAI({ apiKey });
  const router = Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB
    fileFilter: (_req, file, cb) => {
      if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
        return cb(new Error('Only PNG, JPEG, or WebP images are allowed.'));
      }
      cb(null, true);
    },
  });

  router.get('/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_ID });
  });

  router.post('/edit', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
      }

      const { operation } = req.body;
      let params = {};
      if (req.body.params) {
        try {
          params = JSON.parse(req.body.params);
        } catch {
          return res.status(400).json({ error: 'Invalid params JSON.' });
        }
      }

      let prompt;
      try {
        prompt = buildPrompt(operation, params);
      } catch (e) {
        return res.status(400).json({ error: e.message });
      }

      const imagePart = {
        inlineData: {
          mimeType: req.file.mimetype,
          data: req.file.buffer.toString('base64'),
        },
      };

      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
      });

      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imageOut = parts.find((p) => p.inlineData?.data);

      if (!imageOut) {
        const textOut = parts.find((p) => p.text)?.text;
        return res.status(502).json({
          error: 'The model did not return an image.',
          detail: textOut || 'The request may have been blocked by safety filters.',
        });
      }

      res.json({
        image: `data:${imageOut.inlineData.mimeType || 'image/png'};base64,${imageOut.inlineData.data}`,
        operation,
      });
    } catch (err) {
      console.error('Edit error:', err);

      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        const retryMatch = msg.match(/retry in ([\d.]+)/i);
        const wait = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
        return res.status(429).json({
          error: 'Rate limit reached',
          detail: `Đã hết lượt free. Đợi ${wait} giây rồi thử lại nhé.`,
        });
      }

      res.status(err.status || 500).json({
        error: 'Image editing failed.',
        detail: msg || 'Unknown error',
      });
    }
  });

  return router;
}
