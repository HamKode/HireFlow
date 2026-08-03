import 'server-only';
import { groqJSON } from '@/lib/ai/groq';
import { resumeExtractionPrompt } from '@/lib/ai/prompts';
import { ResumeExtractionSchema, type ResumeExtractionResult } from '@/lib/ai/schemas';

// Structured profile extraction from raw resume text. Returns null (rather
// than throwing) on failure so callers can fall back to whatever the
// candidate typed in the application form instead of blocking the whole
// intake pipeline on an AI hiccup.
export async function extractResumeProfile(resumeText: string): Promise<ResumeExtractionResult | null> {
  if (!resumeText.trim()) return null;

  const { system, user } = resumeExtractionPrompt(resumeText);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await groqJSON({ system, user });
      const parsed = ResumeExtractionSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
    } catch {
      // fall through to retry / return null
    }
  }

  return null;
}
