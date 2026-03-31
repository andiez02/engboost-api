import axios from 'axios';
import sequelize from '../../config/sequelize';
import { Flashcard, Folder } from '../../models';
import { ApiError } from '../../utils/ApiError';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

interface VocabItem {
  word: string;
  meaning_vi: string;
  example: string;
}

// ─── AI Prompt ────────────────────────────────────────────────────────────────

function buildPrompt(topic: string, level: string, count: number): string {
  return `You are an English vocabulary teacher. Generate exactly ${count} unique English vocabulary words for the topic "${topic}" at ${level} level.

Return ONLY a valid JSON array with no markdown, no explanation, no code block. Each item must have:
- "word": the English word or short phrase
- "meaning_vi": the Vietnamese translation (concise, 1-5 words)
- "example": one natural English example sentence using the word

Example format:
[{"word":"apple","meaning_vi":"quả táo","example":"She ate a red apple for breakfast."}]

Rules:
- Exactly ${count} items
- No duplicate words
- Words must be relevant to "${topic}"
- Level: ${level} (${level === 'beginner' ? 'common, simple words' : level === 'intermediate' ? 'moderately complex words' : 'advanced, nuanced vocabulary'})
- Return ONLY the JSON array, nothing else`;
}

// ─── Parse & validate AI response ─────────────────────────────────────────────

function parseVocab(raw: string, count: number): VocabItem[] {
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ApiError(502, 'AI returned invalid JSON. Please try again.');
  }

  if (!Array.isArray(parsed)) {
    throw new ApiError(502, 'AI response is not an array. Please try again.');
  }

  const seen = new Set<string>();
  const valid: VocabItem[] = [];

  for (const item of parsed) {
    if (
      typeof item?.word === 'string' &&
      typeof item?.meaning_vi === 'string' &&
      typeof item?.example === 'string' &&
      item.word.trim() &&
      item.meaning_vi.trim()
    ) {
      const key = item.word.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        valid.push({
          word: item.word.trim(),
          meaning_vi: item.meaning_vi.trim(),
          example: item.example.trim(),
        });
      }
    }
  }

  if (valid.length < count) {
    throw new ApiError(
      502,
      `AI returned only ${valid.length} valid unique items (expected ${count}). Please try again.`
    );
  }

  return valid.slice(0, count);
}

// ─── Gemini API call with retry ────────────────────────────────────────────────

async function callGemini(prompt: string, retries = 2): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ApiError(500, 'GEMINI_API_KEY is not configured.');

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        },
        { timeout: 30_000 }
      );

      const text: string =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err: unknown) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status && err.response.status < 500) break;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  if (axios.isAxiosError(lastError)) {
    const status = lastError.response?.status;
    if (status === 401 || status === 403) throw new ApiError(500, 'Invalid Gemini API key.');
    if (status === 429) throw new ApiError(429, 'AI rate limit exceeded. Please try again later.');
    throw new ApiError(502, 'Gemini API is unavailable. Please try again.');
  }

  throw new ApiError(502, 'Failed to reach AI service after retries.');
}

// ─── Fetch image from Pexels ──────────────────────────────────────────────────

async function fetchImageUrl(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await axios.get(PEXELS_API_URL, {
      headers: { Authorization: apiKey },
      params: { query, per_page: 1, orientation: 'landscape' },
      timeout: 5_000,
    });
    const photo = response.data?.photos?.[0];
    return photo?.src?.medium ?? null;
  } catch {
    return null; // image is optional — never fail the whole deck for it
  }
}

// ─── Main service ──────────────────────────────────────────────────────────────

export class DeckService {
  async generateDeck(
    userId: string,
    topic: string,
    level: string,
    count: number
  ): Promise<{ folderId: string }> {
    // 1. Call AI
    const prompt = buildPrompt(topic, level, count);
    const rawText = await callGemini(prompt);

    // 2. Parse & validate
    const vocab = parseVocab(rawText, count);

    // 3. Fetch images in parallel (best-effort — null if Pexels key missing or request fails)
    const imageUrls = await Promise.all(
      vocab.map((v) => fetchImageUrl(v.word))
    );

    // 4. Create folder with timestamp suffix to avoid unique(title, user_id) conflicts
    const baseTitle = `${topic} (${level})`.slice(0, 22);
    const suffix = Date.now().toString().slice(-6);
    const folder = await Folder.create({
      title: `${baseTitle} #${suffix}`,
      user_id: userId,
      is_public: false,
    });

    // 5. Bulk insert - map AI response to new schema
    const now = new Date();
    await Flashcard.bulkCreate(
      vocab.map((v, i) => ({
        english: v.word,
        vietnamese: v.meaning_vi,
        example: v.example, // Map AI example to example field
        pos: null, // AI doesn't provide POS in current implementation
        image_url: imageUrls[i] ?? null,
        folder_id: folder.id,
        user_id: userId,
        is_public: false,
        next_review_at: now,
        repetition: 0,
        interval: 0,
        ease_factor: 2.5,
        last_reviewed_at: null,
        // Note: object field is NOT written for new flashcards
      })),
      { returning: false }
    );

    // 6. Update folder flashcard count
    await sequelize.query(
      'UPDATE folders SET flashcard_count = :count, updated_at = NOW() WHERE id = :id',
      { replacements: { count: vocab.length, id: folder.id } }
    );

    return { folderId: folder.id };
  }
}

export const deckService = new DeckService();
