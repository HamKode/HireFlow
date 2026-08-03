import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { createServiceRoleClient } from '@/lib/supabase/server';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter'];

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !AUTHORIZED_ROLES.includes(user.profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get('path');
  if (!path) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Storage bypasses RLS entirely, so ownership must be verified explicitly:
  // confirm an offer with this exact pdf_url belongs to the caller's org.
  const { data: offer } = await supabase
    .from('offers')
    .select('id')
    .eq('pdf_url', path)
    .eq('organization_id', user.profile.organization_id)
    .maybeSingle();
  if (!offer) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from('offer-letters').createSignedUrl(path, 60 * 5);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Could not create signed URL.' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
