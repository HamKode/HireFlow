import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function listInterviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select(
      '*, interviewer:profiles(id, full_name), application:applications(id, candidate:candidates(id, full_name), job:jobs(id, title))'
    )
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getInterview(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select(
      `*,
      interviewer:profiles(id, full_name),
      application:applications(
        id, status, job_id, candidate_id,
        candidate:candidates(*),
        job:jobs(id, title, required_skills, description)
      ),
      interview_feedback(*)`
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function listInterviewerOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['interviewer', 'hiring_manager', 'admin', 'hr_manager', 'recruiter'])
    .order('full_name');
  if (error) throw error;
  return data;
}
