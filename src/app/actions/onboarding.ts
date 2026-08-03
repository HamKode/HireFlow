'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/dal';
import type { OnboardingTaskStatus } from '@/lib/supabase/types';

export async function updateOnboardingTaskStatus(taskId: string, status: OnboardingTaskStatus) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from('onboarding_tasks').update({ status }).eq('id', taskId);
  if (error) throw error;
  revalidatePath('/onboarding');
}
