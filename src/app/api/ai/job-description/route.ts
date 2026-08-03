import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { groqJSON, AI_CONFIG } from '@/lib/ai/groq';
import { jobDescriptionPrompt } from '@/lib/ai/prompts';
import { JobDescriptionSchema } from '@/lib/ai/schemas';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter'];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !AUTHORIZED_ROLES.includes(user.profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const { system, user: userPrompt } = jobDescriptionPrompt({
    title: body.title,
    department: body.department,
    employmentType: body.employment_type ?? 'full_time',
    experienceRequired: body.experience_required,
    requiredSkills: body.required_skills ?? [],
    preferredSkills: body.preferred_skills ?? [],
  });

  // One extra attempt specifically for schema-shape failures (separate from
  // groqJSON's own retry on transport/parse failures).
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await groqJSON({ system, user: userPrompt });
      const parsed = JobDescriptionSchema.safeParse(raw);
      if (parsed.success) {
        return NextResponse.json({ model: AI_CONFIG.model, result: parsed.data });
      }
      if (attempt === 1) {
        return NextResponse.json(
          { error: 'AI response did not match the expected schema.', details: parsed.error.flatten() },
          { status: 502 }
        );
      }
    } catch (err) {
      if (attempt === 1) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'AI generation failed.' }, { status: 502 });
      }
    }
  }

  return NextResponse.json({ error: 'AI generation failed.' }, { status: 502 });
}
