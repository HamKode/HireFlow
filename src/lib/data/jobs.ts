import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Job, JobStatus } from '@/lib/supabase/types';

export async function listJobs(filters?: { status?: JobStatus; search?: string }) {
  const supabase = await createClient();
  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as Job[];
}

export async function getJob(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Job;
}

export async function countApplicationsForJob(jobId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId);
  return count ?? 0;
}
