import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInterview } from '@/lib/data/interviews';
import { updateInterviewStatus, submitFeedback } from '@/app/actions/interviews';
import { StatusBadge } from '@/components/ui/status-badge';
import { QuestionsPanel } from '@/components/interviews/questions-panel';
import { FeedbackForm } from '@/components/interviews/feedback-form';
import { EvaluationPanel } from '@/components/interviews/evaluation-panel';
import type { InterviewFeedback, InterviewStatus } from '@/lib/supabase/types';
import type { InterviewQuestionsResult } from '@/lib/ai/schemas';

const actionButtonClass =
  'rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900';

const STATUS_OPTIONS: InterviewStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'];

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = await getInterview(id).catch(() => null);
  if (!interview) notFound();

  const candidate = interview.application.candidate;
  const job = interview.application.job;
  const feedbackRows = interview.interview_feedback as unknown as InterviewFeedback[];
  const feedback = Array.isArray(feedbackRows) ? feedbackRows[0] : feedbackRows;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {candidate.full_name} — {job.title}
          </h1>
          <StatusBadge status={interview.status} />
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : 'No time set'} ·{' '}
          {interview.interview_type.replace('_', ' ')} · {interview.duration_minutes} min
          {interview.interviewer && ` · Interviewer: ${interview.interviewer.full_name}`}
        </p>
        {interview.meeting_link && (
          <a href={interview.meeting_link} target="_blank" className="text-sm text-blue-600 hover:underline">
            {interview.meeting_link}
          </a>
        )}
        <div className="mt-2 flex gap-2">
          <Link href={`/candidates/${candidate.id}`} className={actionButtonClass}>
            View candidate
          </Link>
          {STATUS_OPTIONS.filter((s) => s !== interview.status).map((s) => (
            <form key={s} action={updateInterviewStatus.bind(null, interview.id, s)}>
              <button className={actionButtonClass}>Mark {s.replace('_', ' ')}</button>
            </form>
          ))}
        </div>
      </div>

      <QuestionsPanel interviewId={interview.id} initialQuestions={interview.ai_generated_questions as InterviewQuestionsResult | null} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Interviewer feedback</h2>
        <FeedbackForm action={submitFeedback.bind(null, interview.id, interview.application.id)} initial={feedback} />
      </section>

      <EvaluationPanel
        interviewId={interview.id}
        initialSummary={feedback?.ai_evaluation_summary ?? null}
        initialNextAction={feedback?.ai_next_action ?? null}
      />
    </div>
  );
}
