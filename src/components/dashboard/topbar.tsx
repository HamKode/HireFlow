import { logout } from '@/app/actions/auth';
import type { Profile } from '@/lib/supabase/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  hr_manager: 'HR Manager',
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  interviewer: 'Interviewer',
};

export function Topbar({ profile, email }: { profile: Profile; email: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium leading-tight">{profile.full_name}</p>
          <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
            {ROLE_LABELS[profile.role] ?? profile.role} · {email}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
