import { Menu } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { listMyNotifications, getUnreadNotificationCount } from '@/lib/data/notifications';
import { NotificationBell } from '@/components/dashboard/notification-bell';
import type { Profile } from '@/lib/supabase/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  hr_manager: 'HR Manager',
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  interviewer: 'Interviewer',
};

export async function Topbar({ profile, email }: { profile: Profile; email: string }) {
  const [notifications, unreadCount] = await Promise.all([listMyNotifications(), getUnreadNotificationCount()]);
  const initial = (profile.full_name || email).charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-ink-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-ink-950/80">
      <label
        htmlFor="sidebar-toggle"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 lg:hidden dark:text-ink-300 dark:hover:bg-white/5"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </label>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-accent-500 text-sm font-semibold text-white">
            {initial}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-ink-900 dark:text-white">{profile.full_name}</p>
            <p className="text-xs leading-tight text-ink-500">{ROLE_LABELS[profile.role] ?? profile.role}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-secondary px-3! py-1.5! text-xs">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
