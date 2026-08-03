'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CalendarClock,
  FileSignature,
  ClipboardCheck,
  BarChart3,
  Activity,
  Settings,
} from 'lucide-react';
import type { UserRole } from '@/lib/supabase/types';
import type { ComponentType } from 'react';

type NavItem = { label: string; href: string; icon: ComponentType<{ className?: string }>; roles?: UserRole[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Candidates', href: '/candidates', icon: Users },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Interviews', href: '/interviews', icon: CalendarClock },
  { label: 'Offers', href: '/offers', icon: FileSignature, roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Onboarding', href: '/onboarding', icon: ClipboardCheck, roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Automation Logs', href: '/automation-logs', icon: Activity, roles: ['admin', 'hr_manager', 'recruiter'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav
      className="fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full shrink-0 flex-col gap-1 overflow-y-auto bg-ink-950 p-4 transition-transform duration-300 ease-out peer-checked:translate-x-0 lg:static lg:w-64 lg:translate-x-0"
    >
      <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2 py-1.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-accent-500 font-display text-sm font-extrabold text-white shadow-[0_4px_14px_-4px_rgba(47,94,255,0.6)]">
          H
        </span>
        <span className="font-display text-base font-bold tracking-tight text-white">
          HireFlow <span className="text-brand-400">AI</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? 'nav-link-active' : ''}`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-brand-400' : 'text-ink-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
      <p className="px-3 py-2 text-[11px] leading-snug text-ink-500">
        AI-generated assessments are decision-support tools — a human always makes the final call.
      </p>
    </nav>
  );
}
