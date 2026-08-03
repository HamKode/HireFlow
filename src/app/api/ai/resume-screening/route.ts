import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { runResumeScreening, ScreeningError } from '@/lib/ai/screening';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter'];

// Called two ways: (1) an HR user clicking "Run AI Screening" in the dashboard
// (session cookie), or (2) a Make.com scenario's HTTP module (X-Webhook-Secret
// header). Both paths use the service-role client because Make.com never
// carries a Supabase user session.
async function isAuthorized(request: Request): Promise<boolean> {
  const secret = request.headers.get('x-webhook-secret');
  if (secret && process.env.MAKE_WEBHOOK_SECRET && secret === process.env.MAKE_WEBHOOK_SECRET) {
    return true;
  }
  const user = await getCurrentUser();
  return !!user && AUTHORIZED_ROLES.includes(user.profile.role);
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const applicationId = body?.application_id;
  if (!applicationId) {
    return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const result = await runResumeScreening(supabase, applicationId);
    return NextResponse.json({
      weighted_final_score: result.weightedScore,
      routing_decision: result.routingDecision,
      analysis: result.analysis,
    });
  } catch (err) {
    if (err instanceof ScreeningError) {
      return NextResponse.json({ error: err.message }, { status: err.message === 'Application not found.' ? 404 : 502 });
    }
    return NextResponse.json({ error: 'AI screening failed.' }, { status: 500 });
  }
}
