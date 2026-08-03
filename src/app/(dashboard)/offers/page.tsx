import Link from 'next/link';
import { listOffers } from '@/lib/data/offers';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function OffersPage() {
  const offers = await listOffers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Offers</h1>
        <p className="mt-1 text-sm text-ink-500">Every offer letter, from draft to signed.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3">Joining date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr
                  key={offer.id}
                  className="border-t border-ink-100 transition-colors hover:bg-ink-50/70 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link href={`/offers/${offer.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                      {offer.candidate.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{offer.job.title}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">
                    {offer.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={offer.status} />
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">
                    No offers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
