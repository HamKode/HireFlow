import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOffer } from '@/lib/data/offers';
import { sendOffer, markOfferSigned } from '@/app/actions/offers';
import { StatusBadge } from '@/components/ui/status-badge';
import { OfferPdfLink } from '@/components/offers/offer-pdf-link';

const actionButtonClass =
  'rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900';

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(id).catch(() => null);
  if (!offer) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{offer.candidate.full_name}</h1>
            <StatusBadge status={offer.status} />
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {offer.job.title} {offer.job.department && `· ${offer.job.department}`}
          </p>
        </div>
        <Link href={`/candidates/${offer.candidate.id}`} className={actionButtonClass}>
          View candidate
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Salary" value={offer.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
        <Info label="Employment type" value={offer.employment_type.replace('_', ' ')} />
        <Info label="Joining date" value={offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : null} />
        <Info
          label="Acceptance deadline"
          value={offer.acceptance_deadline ? new Date(offer.acceptance_deadline).toLocaleDateString() : null}
        />
      </div>

      {offer.benefits && (
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Benefits</p>
          <p className="text-sm">{offer.benefits}</p>
        </div>
      )}

      {offer.pdf_url && <OfferPdfLink path={offer.pdf_url} />}

      <div className="flex flex-wrap gap-2">
        {offer.status === 'draft' && (
          <form action={sendOffer.bind(null, offer.id)}>
            <button className={actionButtonClass}>Send offer</button>
          </form>
        )}
        {offer.status === 'sent' && (
          <form action={markOfferSigned.bind(null, offer.id)}>
            <button className={actionButtonClass}>Mark as signed (simulate e-signature)</button>
          </form>
        )}
        {offer.status === 'signed' && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Signed {offer.signed_at && new Date(offer.signed_at).toLocaleString()} — onboarding tasks created.
          </p>
        )}
      </div>

      {offer.status === 'sent' && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          In production this happens automatically when the candidate signs via DocuSign/Dropbox Sign (see{' '}
          <code>docs/make-scenarios/03-e-signature.md</code>) — the button above simulates that for demo purposes.
        </p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p>{value}</p>
    </div>
  );
}
