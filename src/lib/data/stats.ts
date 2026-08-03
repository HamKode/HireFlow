import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();

  const [openJobs, applications, screening, shortlisted, interviews, offers, hired] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'screening'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'shortlisted'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'interview_scheduled'),
    supabase.from('offers').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'hired'),
  ]);

  return {
    openJobs: openJobs.count ?? 0,
    applications: applications.count ?? 0,
    inScreening: screening.count ?? 0,
    shortlisted: shortlisted.count ?? 0,
    interviews: interviews.count ?? 0,
    offers: offers.count ?? 0,
    hired: hired.count ?? 0,
  };
}
