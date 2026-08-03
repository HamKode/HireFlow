import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { applyOfferSigned } from '@/app/actions/offers';

// Called by the Make.com e-signature scenario (docs/make-scenarios/03-e-signature.md)
// when DocuSign/Dropbox Sign reports a completed signature. Secured with the
// same shared secret pattern as /api/ai/resume-screening's webhook path.
export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const offerId = body?.offer_id;
  if (!offerId) {
    return NextResponse.json({ error: 'offer_id is required' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    await applyOfferSigned(supabase, offerId, 'make.com');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to process signature.' }, { status: 500 });
  }
}
