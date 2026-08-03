'use client';

import { useState } from 'react';

export function CopyApplyLink({ jobId }: { jobId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/apply/${jobId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={copy} className="btn-secondary">
      {copied ? 'Link copied' : 'Copy application link'}
    </button>
  );
}
