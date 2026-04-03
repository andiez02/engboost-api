import axios from 'axios';
import { SensesSchema } from '../flashcard/flashcard.utils';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface DetectionRaw {
  object?: string;
  english?: string;
  vietnamese?: string;
  [key: string]: unknown;
}

export interface EnrichedDetection {
  headword: string;
  pos: string;
  senses: {
    definition: string;
    translation: string;
    examples: { sentence: string }[];
  }[];
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildEnrichPrompt(words: string[]): string {
  const list = words.map((w, i) => `${i + 1}. ${w}`).join('\n');
  return `You are an English vocabulary teacher. Enrich the following English words detected from an image.

Words:
${list}

Return ONLY a valid JSON array (no markdown, no explanation). Each item must have:
- "headword": the English word (match the input word exactly)
- "pos": part of speech (noun, verb, adjective, etc.)
- "senses": array with exactly one object containing:
  - "definition": clear English definition
  - "translation": Vietnamese translation
  - "examples": array of 2 example objects, each with a "sentence" string

Return exactly ${words.length} items in the same order as the input list.
Return ONLY the JSON array, nothing else.`;
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    },
    { timeout: 30_000 }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Parse Gemini response ────────────────────────────────────────────────────

function parseEnriched(raw: string, fallbacks: DetectionRaw[]): EnrichedDetection[] {
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return buildFallbacks(fallbacks);
  }

  if (!Array.isArray(parsed)) return buildFallbacks(fallbacks);

  return parsed.map((item: any, i) => {
    const sensesResult = SensesSchema.safeParse(item?.senses);
    const fallback = fallbacks[i];
    const headword = (item?.headword || fallback?.english || fallback?.object || '').trim();
    const pos = (item?.pos || 'noun').trim();

    if (!headword || !sensesResult.success) {
      return buildFallbackItem(fallback);
    }

    return { headword, pos, senses: sensesResult.data };
  });
}

function buildFallbackItem(raw: DetectionRaw): EnrichedDetection {
  const headword = (raw?.english || raw?.object || '').trim();
  const translation = (raw?.vietnamese || headword).trim();
  return {
    headword,
    pos: 'noun',
    senses: [{
      definition: `${headword}: ${translation}`,
      translation,
      examples: [],
    }],
  };
}

function buildFallbacks(raws: DetectionRaw[]): EnrichedDetection[] {
  return raws.map(buildFallbackItem);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function enrichDetections(
  detections: DetectionRaw[]
): Promise<EnrichedDetection[]> {
  if (!detections.length) return [];

  const words = detections.map((d) => (d.english || d.object || '').trim()).filter(Boolean);

  try {
    const raw = await callGemini(buildEnrichPrompt(words));
    return parseEnriched(raw, detections);
  } catch {
    // Gemini failed — return minimal fallback so the feature still works
    return buildFallbacks(detections);
  }
}
