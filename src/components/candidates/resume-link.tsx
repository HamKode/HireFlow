'use client';

import { useState } from 'react';

export function ResumeLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/signed-url?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not open resume.');
        return;
      }
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {loading ? 'Opening…' : 'View uploaded resume'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
