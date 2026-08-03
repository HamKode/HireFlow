import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Candidate } from '@/lib/supabase/types';

export async function listCandidates(search?: string) {
  const supabase = await createClient();
  let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Candidate[];
}

export async function getCandidate(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Candidate;
}

export async function getCandidateApplications(candidateId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(
      '*, job:jobs(id, title, department, employment_type), candidate_scores(*), interviews(id, status, scheduled_at, interview_type), offers(id, status)'
    )
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
