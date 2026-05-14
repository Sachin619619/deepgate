import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { KeysClient } from './keys-client';

export const dynamic = 'force-dynamic';

export default async function KeysPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return (
    <DashboardShell email={user.email}>
      <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
      <p className="text-[color:var(--muted)] text-sm mt-1 mb-6">
        Use these as a Bearer token in <code className="code">Authorization</code>. Treat them like passwords.
      </p>
      <KeysClient />
    </DashboardShell>
  );
}
