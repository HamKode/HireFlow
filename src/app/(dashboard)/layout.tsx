import { requireUser } from '@/lib/auth/dal';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex flex-1 bg-background">
      <input type="checkbox" id="sidebar-toggle" className="peer hidden" />
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 z-30 hidden bg-ink-950/60 backdrop-blur-sm peer-checked:block lg:hidden"
        aria-hidden="true"
      />
      <Sidebar role={user.profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={user.profile} email={user.email} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="animate-fade-up mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-ink-200/70 px-4 py-3 text-xs text-ink-400 sm:px-6 dark:border-white/10">
          AI-generated assessments are decision-support tools and should be reviewed by authorized HR personnel.
        </footer>
      </div>
    </div>
  );
}
