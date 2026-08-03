import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function listOffers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, candidate:candidates(id, full_name, email), job:jobs(id, title)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOffer(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, candidate:candidates(id, full_name, email), job:jobs(id, title, department), application:applications(id, status)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getOfferByApplication(applicationId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('offers').select('id, status').eq('application_id', applicationId).maybeSingle();
  return data;
}
