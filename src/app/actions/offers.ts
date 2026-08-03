'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/dal';
import { notifyApplicationEvent } from '@/lib/integrations/make';
import { generateOfferLetterPdf } from '@/lib/pdf/offer-letter';
import { createDefaultOnboardingTasks } from '@/lib/onboarding/tasks';
import type { Application, EmploymentType } from '@/lib/supabase/types';

export type OfferFormState = { error?: string } | undefined;

const COMPANY_NAME = 'HireFlow AI';

export async function createOffer(
  applicationId: string,
  _prevState: OfferFormState,
  formData: FormData
): Promise<OfferFormState> {
  const user = await requireRole('admin', 'hr_manager', 'recruiter');

  const salary = Number(formData.get('salary') ?? 0);
  if (!salary) return { error: 'Salary is required.' };

  const supabase = await createClient();

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, candidate:candidates(id, full_name), job:jobs(id, title, department, employment_type)')
    .eq('id', applicationId)
    .single();

  if (appError || !application) return { error: 'Application not found.' };

  const candidate = application.candidate as unknown as { id: string; full_name: string };
  const job = application.job as unknown as { id: string; title: string; department: string | null; employment_type: EmploymentType };

  const joiningDate = String(formData.get('joining_date') ?? '') || null;
  const benefits = String(formData.get('benefits') ?? '').trim() || null;
  const acceptanceDeadline = String(formData.get('acceptance_deadline') ?? '') || null;
  const employmentType = (String(formData.get('employment_type') ?? job.employment_type) as EmploymentType) || job.employment_type;

  const pdfBytes = await generateOfferLetterPdf({
    candidateName: candidate.full_name,
    jobTitle: job.title,
    department: job.department,
    salary,
    employmentType,
    joiningDate,
    benefits,
    acceptanceDeadline,
    companyName: COMPANY_NAME,
  });

  const pdfPath = `${candidate.id}/${Date.now()}-offer-letter.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('offer-letters')
    .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .insert({
      application_id: applicationId,
      candidate_id: candidate.id,
      job_id: job.id,
      salary,
      joining_date: joiningDate,
      employment_type: employmentType,
      benefits,
      acceptance_deadline: acceptanceDeadline,
      pdf_url: pdfPath,
      status: 'draft',
      approved_by: user.id,
    })
    .select('id')
    .single();

  if (offerError || !offer) return { error: offerError?.message ?? 'Failed to create offer.' };

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    candidate_id: candidate.id,
    action: 'OFFER_GENERATED',
    status: 'success',
    source: 'dashboard',
    payload: { offer_id: offer.id },
  });

  revalidatePath('/offers');
  redirect(`/offers/${offer.id}`);
}

export async function sendOffer(offerId: string) {
  await requireRole('admin', 'hr_manager', 'recruiter');
  const supabase = await createClient();

  const { data: offer, error } = await supabase
    .from('offers')
    .update({ status: 'sent' })
    .eq('id', offerId)
    .select('application_id, candidate_id')
    .single();
  if (error) throw error;

  const { data: previous } = await supabase.from('applications').select('status').eq('id', offer.application_id).single();
  const { data: application } = await supabase
    .from('applications')
    .update({ status: 'offer_sent' })
    .eq('id', offer.application_id)
    .select('*')
    .single();

  await supabase.from('automation_logs').insert({
    application_id: offer.application_id,
    candidate_id: offer.candidate_id,
    action: 'OFFER_SENT',
    status: 'success',
    source: 'dashboard',
    payload: { offer_id: offerId },
  });

  if (application) {
    await notifyApplicationEvent(supabase, {
      type: 'UPDATE',
      record: application as Application,
      oldRecord: previous ? { status: previous.status } : null,
    });
  }

  revalidatePath(`/offers/${offerId}`);
  revalidatePath('/offers');
}

// Marks the offer signed and cascades: offer_accepted -> hired -> onboarding
// tasks created. In production this is called by the e-signature webhook
// (src/app/api/webhooks/esignature/route.ts) when DocuSign/Dropbox Sign
// reports completion; exposed here too so HR can simulate the flow in a
// demo without a real e-signature account connected.
export async function markOfferSigned(offerId: string) {
  await requireRole('admin', 'hr_manager', 'recruiter');
  const supabase = await createClient();
  await applyOfferSigned(supabase, offerId, 'dashboard');
  revalidatePath(`/offers/${offerId}`);
  revalidatePath('/offers');
  revalidatePath('/onboarding');
}

export async function applyOfferSigned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  offerId: string,
  source: string
) {
  const { data: offer, error } = await supabase
    .from('offers')
    .update({ status: 'signed', signed_at: new Date().toISOString() })
    .eq('id', offerId)
    .select('application_id, candidate_id')
    .single();
  if (error) throw error;

  await supabase.from('automation_logs').insert({
    application_id: offer.application_id,
    candidate_id: offer.candidate_id,
    action: 'OFFER_SIGNED',
    status: 'success',
    source,
    payload: { offer_id: offerId },
  });

  const { data: previous } = await supabase.from('applications').select('status').eq('id', offer.application_id).single();
  const { data: acceptedApp } = await supabase
    .from('applications')
    .update({ status: 'offer_accepted' })
    .eq('id', offer.application_id)
    .select('*')
    .single();

  if (acceptedApp) {
    await notifyApplicationEvent(supabase, {
      type: 'UPDATE',
      record: acceptedApp as Application,
      oldRecord: previous ? { status: previous.status } : null,
    });
  }

  const { data: hiredApp } = await supabase
    .from('applications')
    .update({ status: 'onboarding' })
    .eq('id', offer.application_id)
    .select('*')
    .single();

  await supabase.from('automation_logs').insert({
    application_id: offer.application_id,
    candidate_id: offer.candidate_id,
    action: 'CANDIDATE_HIRED',
    status: 'success',
    source,
  });

  await createDefaultOnboardingTasks(supabase, offer.candidate_id, offerId);

  await supabase.from('automation_logs').insert({
    application_id: offer.application_id,
    candidate_id: offer.candidate_id,
    action: 'ONBOARDING_TASKS_CREATED',
    status: 'success',
    source,
  });

  if (hiredApp) {
    await notifyApplicationEvent(supabase, {
      type: 'UPDATE',
      record: hiredApp as Application,
      oldRecord: { status: 'offer_accepted' },
    });
  }
}
