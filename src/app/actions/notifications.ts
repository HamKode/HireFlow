'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/dal';

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', user.id);
  revalidatePath('/', 'layout');
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  revalidatePath('/', 'layout');
}
