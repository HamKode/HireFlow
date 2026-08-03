import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ApplicationStatus } from '@/lib/supabase/types';

export async function listApplications(filters?: { jobId?: string; status?: ApplicationStatus }) {
  const supabase = await createClient();
  let query = supabase
    .from('applications')
    .select('*, job:jobs(id, title), candidate:candidates(id, full_name, email)')
    .order('created_at', { ascending: false });

  if (filters?.jobId) query = query.eq('job_id', filters.jobId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listCandidateOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('candidates').select('id, full_name, email').order('full_name');
  if (error) throw error;
  return data;
}

export async function listJobOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('jobs').select('id, title').order('title');
  if (error) throw error;
  return data;
}
