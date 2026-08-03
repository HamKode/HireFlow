import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getOffer } from '@/lib/data/offers';
import { sendOffer, markOfferSigned } from '@/app/actions/offers';
import { StatusBadge } from '@/components/ui/status-badge';
import { OfferPdfLink } from '@/components/offers/offer-pdf-link';

const actionButtonClass = 'btn-secondary';

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(id).catch(() => null);
  if (!offer) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
              {offer.candidate.full_name}
            </h1>
            <StatusBadge status={offer.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {offer.job.title} {offer.job.department && `· ${offer.job.department}`}
          </p>
        </div>
        <Link href={`/candidates/${offer.candidate.id}`} className={actionButtonClass}>
          View candidate
        </Link>
      </div>

      <div className="card grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
        <Info label="Salary" value={offer.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
        <Info label="Employment type" value={offer.employment_type.replace('_', ' ')} />
        <Info label="Joining date" value={offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : null} />
        <Info
          label="Acceptance deadline"
          value={offer.acceptance_deadline ? new Date(offer.acceptance_deadline).toLocaleDateString() : null}
        />
      </div>

      {offer.benefits && (
        <div className="card p-5">
          <p className="text-xs font-medium text-ink-500">Benefits</p>
          <p className="mt-1 text-sm text-ink-700 dark:text-ink-300">{offer.benefits}</p>
        </div>
      )}

      {offer.pdf_url && <OfferPdfLink path={offer.pdf_url} />}

      <div className="flex flex-wrap gap-2">
        {offer.status === 'draft' && (
          <form action={sendOffer.bind(null, offer.id)}>
            <button className="btn-primary">Send offer</button>
          </form>
        )}
        {offer.status === 'sent' && (
          <form action={markOfferSigned.bind(null, offer.id)}>
            <button className="btn-primary">Confirm signature received</button>
          </form>
        )}
        {offer.status === 'signed' && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Signed {offer.signed_at && new Date(offer.signed_at).toLocaleString()} — onboarding tasks created.
          </p>
        )}
      </div>

      {offer.status === 'sent' && (
        <p className="text-xs text-ink-400">
          Awaiting the candidate&apos;s signature. Once connected to an e-signature provider, this will
          be confirmed automatically — until then, confirm manually once they&apos;ve signed.
        </p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}
