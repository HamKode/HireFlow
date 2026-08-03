import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ApplicationStatus, CandidateSource } from '@/lib/supabase/types';

const REACHED_SCREENING: ApplicationStatus[] = [
  'screening', 'hr_review', 'shortlisted', 'interview_scheduled', 'interviewed',
  'final_review', 'offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'onboarding',
];
const REACHED_SHORTLIST: ApplicationStatus[] = [
  'shortlisted', 'interview_scheduled', 'interviewed', 'final_review',
  'offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'onboarding',
];
const REACHED_INTERVIEW: ApplicationStatus[] = [
  'interview_scheduled', 'interviewed', 'final_review', 'offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'onboarding',
];
const REACHED_OFFER: ApplicationStatus[] = ['offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'onboarding'];
const REACHED_OFFER_SENT: ApplicationStatus[] = ['offer_sent', 'offer_accepted', 'hired', 'onboarding'];
const REACHED_HIRED: ApplicationStatus[] = ['hired', 'onboarding'];

function pct(part: number, whole: number) {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

export async function getAnalyticsSummary() {
  const supabase = await createClient();

  const [{ data: applications }, { data: scores }, { data: jobs }, { data: hireLogs }, { data: feedback }] =
    await Promise.all([
      supabase.from('applications').select('id, job_id, candidate_id, status, source, created_at'),
      supabase.from('candidate_scores').select('application_id, weighted_final_score'),
      supabase.from('jobs').select('id, title'),
      supabase.from('automation_logs').select('application_id, created_at').eq('action', 'CANDIDATE_HIRED'),
      supabase
        .from('interview_feedback')
        .select('technical_knowledge, problem_solving, communication, role_fit, experience_rating'),
    ]);

  const apps = applications ?? [];
  const total = apps.length;

  const statusCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  for (const app of apps) {
    statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1);
    sourceCounts.set(app.source, (sourceCounts.get(app.source) ?? 0) + 1);
  }

  const countReached = (statuses: ApplicationStatus[]) => apps.filter((a) => statuses.includes(a.status)).length;

  const funnel = [
    { stage: 'Applied', count: total },
    { stage: 'Screening', count: countReached(REACHED_SCREENING) },
    { stage: 'Shortlisted', count: countReached(REACHED_SHORTLIST) },
    { stage: 'Interviewed', count: countReached(REACHED_INTERVIEW) },
    { stage: 'Offer', count: countReached(REACHED_OFFER) },
    { stage: 'Hired', count: countReached(REACHED_HIRED) },
  ];

  const avgScore = scores && scores.length > 0
    ? Math.round((scores.reduce((sum, s) => sum + (s.weighted_final_score ?? 0), 0) / scores.length) * 10) / 10
    : null;

  const avgInterviewScore = (() => {
    if (!feedback || feedback.length === 0) return null;
    const composites = feedback
      .map((f) => {
        const vals = [f.technical_knowledge, f.problem_solving, f.communication, f.role_fit, f.experience_rating].filter(
          (v): v is number => v != null
        );
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      })
      .filter((v): v is number => v != null);
    if (composites.length === 0) return null;
    return Math.round((composites.reduce((a, b) => a + b, 0) / composites.length) * 10) / 10;
  })();

  const applicationById = new Map(apps.map((a) => [a.id, a]));
  const hireDurations: number[] = [];
  for (const log of hireLogs ?? []) {
    const app = applicationById.get(log.application_id);
    if (!app) continue;
    const days = (new Date(log.created_at).getTime() - new Date(app.created_at).getTime()) / 86_400_000;
    if (days >= 0) hireDurations.push(days);
  }
  const avgTimeToHireDays = hireDurations.length > 0
    ? Math.round((hireDurations.reduce((a, b) => a + b, 0) / hireDurations.length) * 10) / 10
    : null;

  const jobTitleById = new Map((jobs ?? []).map((j) => [j.id, j.title]));
  const perJobMap = new Map<string, { title: string; applications: number; hires: number }>();
  for (const app of apps) {
    const entry = perJobMap.get(app.job_id) ?? {
      title: jobTitleById.get(app.job_id) ?? 'Unknown job',
      applications: 0,
      hires: 0,
    };
    entry.applications++;
    if (REACHED_HIRED.includes(app.status)) entry.hires++;
    perJobMap.set(app.job_id, entry);
  }

  const perSourceMap = new Map<string, { applications: number; hires: number }>();
  for (const app of apps) {
    const entry = perSourceMap.get(app.source) ?? { applications: 0, hires: 0 };
    entry.applications++;
    if (REACHED_HIRED.includes(app.status)) entry.hires++;
    perSourceMap.set(app.source, entry);
  }

  return {
    total,
    statusCounts: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    sourceCounts: Array.from(sourceCounts.entries()).map(([source, count]) => ({
      source: source as CandidateSource,
      count,
    })),
    funnel,
    rates: {
      shortlist: pct(countReached(REACHED_SHORTLIST), total),
      interview: pct(countReached(REACHED_INTERVIEW), total),
      offer: pct(countReached(REACHED_OFFER), total),
      offerAcceptance: pct(countReached(REACHED_HIRED), countReached(REACHED_OFFER_SENT)),
      hire: pct(countReached(REACHED_HIRED), total),
    },
    avgScore,
    avgInterviewScore,
    avgTimeToHireDays,
    perJob: Array.from(perJobMap.values()).sort((a, b) => b.applications - a.applications),
    perSource: Array.from(perSourceMap.entries())
      .map(([source, v]) => ({ source: source as CandidateSource, ...v }))
      .sort((a, b) => b.applications - a.applications),
  };
}
