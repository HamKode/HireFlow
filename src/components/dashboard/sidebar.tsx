'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/supabase/types';

type NavItem = { label: string; href: string; roles?: UserRole[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Applications', href: '/applications' },
  { label: 'Interviews', href: '/interviews' },
  { label: 'Offers', href: '/offers', roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Onboarding', href: '/onboarding', roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Analytics', href: '/analytics', roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Automation Logs', href: '/automation-logs', roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Settings', href: '/settings', roles: ['admin'] },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-200 p-4 dark:border-neutral-800">
      <Link href="/dashboard" className="mb-4 px-2 text-lg font-semibold tracking-tight">
        HireFlow AI
      </Link>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
