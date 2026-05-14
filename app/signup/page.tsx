'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(j.message || j.error || 'Sign up failed');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center px-5 py-14 relative">
      <div className="w-full max-w-sm relative">
        <Link href="/" className="flex items-center gap-2 font-semibold mb-8 justify-center text-[color:var(--text)]">
          <span className="text-[color:var(--accent)]"><LogoMark size={22} /></span>
          DeepGate
        </Link>
        <div className="card-elev p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">7-day free trial &middot; 100K tokens &middot; no card</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Name (optional)</label>
              <input className="input mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
            </div>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Work email</label>
              <input className="input mt-1" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Password</label>
              <input className="input mt-1" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            {err && <div className="text-sm text-[color:var(--danger)]">{err}</div>}
            <button className="btn btn-primary w-full justify-center mt-2" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <div className="text-sm text-[color:var(--muted)] mt-5 text-center">
            Already have an account? <Link href="/login" className="link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
