import 'server-only';

// Centralized AI configuration. Changing the model or temperature here
// changes it everywhere (dashboard AI features + the API routes Make.com
// scenarios call) without touching any workflow logic.
export const AI_CONFIG = {
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: 0.3,
  maxRetries: 2,
} as const;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqError extends Error {}

// Calls Groq's chat completions API in JSON mode and returns the raw parsed
// JSON. Retries on transient failures / invalid JSON per AI_CONFIG.maxRetries.
// Callers are responsible for validating the shape (see lib/ai/schemas.ts).
export async function groqJSON(params: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError('GROQ_API_KEY is not set.');
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          temperature: params.temperature ?? AI_CONFIG.temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: params.system },
            { role: 'user', content: params.user },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new GroqError(`Groq API error ${response.status}: ${body}`);
      }

      const payload = await response.json();
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new GroqError('Groq response had no content.');
      }

      return JSON.parse(content);
    } catch (err) {
      lastError = err;
      if (attempt < AI_CONFIG.maxRetries) continue;
    }
  }

  throw lastError instanceof Error ? lastError : new GroqError('Groq call failed.');
}
