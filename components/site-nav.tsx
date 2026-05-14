import Link from 'next/link';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[color:var(--bg)]/80 border-b border-[color:var(--border)]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block w-6 h-6 rounded-md bg-[color:var(--accent)]" style={{ boxShadow: '0 0 12px rgba(90,247,142,.55)' }} />
          <span>DeepGate</span>
          <span className="text-[10px] uppercase tracking-widest text-[color:var(--muted)] border border-[color:var(--border)] px-1.5 py-0.5 rounded">India</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link href="/#pricing" className="hidden sm:inline px-3 py-1.5 text-[color:var(--muted)] hover:text-[color:var(--text)]">Pricing</Link>
          <Link href="/#docs" className="hidden sm:inline px-3 py-1.5 text-[color:var(--muted)] hover:text-[color:var(--text)]">Docs</Link>
          <Link href="/login" className="px-3 py-1.5 text-[color:var(--muted)] hover:text-[color:var(--text)]">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Start free</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[color:var(--muted)]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-[color:var(--accent)]" />
          DeepGate &copy; {new Date().getFullYear()} — Built in Bangalore.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[color:var(--text)]">Terms</Link>
          <Link href="/privacy" className="hover:text-[color:var(--text)]">Privacy</Link>
          <a href="mailto:hello@deepgate.dev" className="hover:text-[color:var(--text)]">Contact</a>
        </div>
      </div>
    </footer>
  );
}
