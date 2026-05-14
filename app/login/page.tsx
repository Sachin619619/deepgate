'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';

function mapServerError(j: { error?: string; message?: string }): string {
  if (j?.message) return j.message;
  switch (j?.error) {
    case 'invalid_credentials': return 'Email or password is incorrect.';
    case 'missing_fields': return 'Please enter your email and password.';
    case 'invalid_json': return 'Something went wrong. Please try again.';
    default: return 'Login failed. Please try again.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(mapServerError(j));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErr('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center px-5 py-14 relative">
      <div className="w-full max-w-sm relative">
        <Link href="/" className="flex items-center gap-2 font-semibold mb-8 justify-center text-[color:var(--text)]">
          <span className="text-[color:var(--accent)]"><LogoMark size={22} /></span>
          DeepGate
        </Link>
        <div className="card-elev p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">Sign in to your DeepGate dashboard</p>
          <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Email</label>
              <input
                className="input mt-1"
                type="email"
                inputMode="email"
                autoComplete="username"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@email.com"
              />
            </div>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Password</label>
              <input
                className="input mt-1"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {err && (
              <div className="text-sm text-[color:var(--danger)] rounded-lg px-3 py-2" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                {err}
              </div>
            )}
            <button className="btn btn-primary w-full justify-center mt-2" type="submit" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
          <div className="text-sm text-[color:var(--muted)] mt-5 text-center">
            Need an account? <Link href="/signup" className="link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
