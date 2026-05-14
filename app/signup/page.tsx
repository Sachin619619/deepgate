'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
  'throwawaymail.com', 'yopmail.com', 'fakemail.net', 'trashmail.com', 'sharklasers.com',
  'maildrop.cc', 'getnada.com', 'dispostable.com', 'mailnesia.com', 'mintemail.com',
  'mohmal.com', 'emailondeck.com', 'tempinbox.com', 'spambox.us', 'mytemp.email',
  'tempr.email', 'fakeinbox.com', 'mailcatch.com', 'spam4.me', 'trbvm.com',
  'throwaway.email', 'mvrht.net', 'mailtemp.info', 'mailhole.de', 'getairmail.com',
]);

function validateEmail(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Please enter a valid email';
  const domain = t.slice(t.lastIndexOf('@') + 1);
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return 'Disposable emails not allowed';
  return null;
}

function validatePassword(p: string): string | null {
  if (!p || p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(p)) return 'Password must include a capital letter';
  if (!/[a-z]/.test(p)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(p)) return 'Password must include a number';
  return null;
}

function mapServerError(j: { error?: string; message?: string }): string {
  if (j?.message) return j.message;
  switch (j?.error) {
    case 'email_taken': return 'An account with this email already exists. Try signing in instead.';
    case 'invalid_email': return 'Please enter a valid email address.';
    case 'password_too_short': return 'Password must be at least 8 characters.';
    case 'invalid_json': return 'Something went wrong. Please try again.';
    default: return 'Sign up failed. Please try again.';
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setEmailError(null);

    const eErr = validateEmail(email);
    if (eErr) { setEmailError(eErr); setErr(eErr); return; }
    const pErr = validatePassword(password);
    if (pErr) { setErr(pErr); return; }

    setLoading(true);
    try {
      const r = await fetch('/api/auth/signup', {
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
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">7-day free trial &middot; 100K tokens &middot; no card</p>

          <form onSubmit={submit} className="space-y-3 mt-6" noValidate>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Email</label>
              <input
                className="input mt-1"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                onBlur={() => { if (email) setEmailError(validateEmail(email)); }}
                placeholder="name@email.com"
                aria-invalid={!!emailError}
              />
              {emailError && <div className="text-xs text-[color:var(--danger)] mt-1.5">{emailError}</div>}
            </div>
            <div>
              <label className="text-xs text-[color:var(--muted)] uppercase tracking-widest">Password</label>
              <input
                className="input mt-1"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
              <p className="mt-1.5 text-xs text-[color:var(--muted-2)]">At least 8 characters with a capital letter and a number</p>
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
                  Creating account…
                </span>
              ) : 'Create account'}
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
