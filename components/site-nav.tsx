import Link from 'next/link';
import { LogoMark } from './logo';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--bg)]/75 border-b border-[color:var(--border)]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-[color:var(--text)]">
          <span className="text-[color:var(--accent)]"><LogoMark size={22} /></span>
          <span>DeepGate</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link href="/#pricing" className="hidden sm:inline px-3 py-1.5 rounded-md text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors">Pricing</Link>
          <Link href="/#docs" className="hidden sm:inline px-3 py-1.5 rounded-md text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors">Docs</Link>
          <Link href="/login" className="px-3 py-1.5 rounded-md text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors">Sign in</Link>
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
          <span className="text-[color:var(--accent)]"><LogoMark size={16} /></span>
          <span>DeepGate &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-[color:var(--text)] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[color:var(--text)] transition-colors">Privacy</Link>
          <a href="mailto:hello@deepgate.dev" className="hover:text-[color:var(--text)] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
