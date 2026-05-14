'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function DashboardShell({ children, email }: { children: React.ReactNode; email: string }) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const tabs = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/keys', label: 'API keys' },
    { href: '/billing', label: 'Billing' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block w-6 h-6 rounded-md bg-[color:var(--accent)]" />
            DeepGate
          </Link>
          <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <span className="hidden sm:inline">{email}</span>
            <button onClick={logout} className="btn btn-ghost py-1.5">Sign out</button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-5 -mt-px overflow-x-auto scroll-mute">
          <div className="flex gap-1 h-10">
            {tabs.map(t => {
              const active = path === t.href;
              return (
                <Link key={t.href} href={t.href}
                  className={`px-3 h-full inline-flex items-center text-sm border-b-2 -mb-px ${active ? 'border-[color:var(--accent)] text-[color:var(--text)]' : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="max-w-6xl w-full mx-auto px-5 py-8 flex-1">{children}</main>
    </div>
  );
}
