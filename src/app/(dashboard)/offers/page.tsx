import Link from 'next/link';
import { listOffers } from '@/lib/data/offers';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function OffersPage() {
  const offers = await listOffers();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Offers</h1>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Salary</th>
              <th className="px-4 py-3 font-medium">Joining date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr
                key={offer.id}
                className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link href={`/offers/${offer.id}`} className="font-medium hover:underline">
                    {offer.candidate.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{offer.job.title}</td>
                <td className="px-4 py-3">{offer.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={offer.status} />
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No offers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
