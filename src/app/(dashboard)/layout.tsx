import { requireUser } from '@/lib/auth/dal';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex flex-1">
      <Sidebar role={user.profile.role} />
      <div className="flex flex-1 flex-col">
        <Topbar profile={user.profile} email={user.email} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <footer className="border-t border-neutral-200 px-6 py-3 text-xs text-neutral-400 dark:border-neutral-800">
          AI-generated assessments are decision-support tools and should be reviewed by authorized HR personnel.
        </footer>
      </div>
    </div>
  );
}
