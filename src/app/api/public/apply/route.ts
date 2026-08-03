import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { processApplicationIntake, IntakeError } from '@/lib/applications/intake';
import type { CandidateSource } from '@/lib/supabase/types';

const VALID_SOURCES: CandidateSource[] = [
  'linkedin',
  'indeed',
  'company_website',
  'referral',
  'recruiter',
  'job_board',
  'social_media',
  'other',
];

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
  }

  const jobId = str(formData, 'job_id');
  const fullName = str(formData, 'full_name');
  const email = str(formData, 'email');

  if (!jobId || !fullName || !email) {
    return NextResponse.json({ error: 'Job, full name, and email are required.' }, { status: 400 });
  }

  const sourceRaw = str(formData, 'source');
  const source: CandidateSource = VALID_SOURCES.includes(sourceRaw as CandidateSource)
    ? (sourceRaw as CandidateSource)
    : 'company_website';

  const resumeEntry = formData.get('resume');
  const resumeFile = resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null;

  if (resumeFile && resumeFile.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Resume file must be under 10MB.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const result = await processApplicationIntake(supabase, {
      jobId,
      fullName,
      email,
      phone: str(formData, 'phone'),
      location: str(formData, 'location'),
      linkedinUrl: str(formData, 'linkedin_url'),
      githubUrl: str(formData, 'github_url'),
      portfolioUrl: str(formData, 'portfolio_url'),
      yearsExperience: str(formData, 'years_experience') ? Number(str(formData, 'years_experience')) : undefined,
      expectedSalary: str(formData, 'expected_salary') ? Number(str(formData, 'expected_salary')) : undefined,
      noticePeriod: str(formData, 'notice_period'),
      coverLetter: str(formData, 'cover_letter'),
      source,
      resumeFile,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof IntakeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Application intake failed:', err);
    return NextResponse.json({ error: 'Something went wrong submitting your application.' }, { status: 500 });
  }
}
