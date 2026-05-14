'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '425613513915-qbheokls4nqe7fa48463ok42ef08a93v.apps.googleusercontent.com').trim();
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type Props = {
  mode: 'signin' | 'signup';
  onError?: (msg: string) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let scriptLoading: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi_load_failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gsi_load_failed'));
    document.head.appendChild(s);
  });
  return scriptLoading;
}

export function GoogleSignInButton({ mode, onError }: Props) {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          itp_support: false,
          use_fedcm_for_prompt: false,
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: btnRef.current.clientWidth || 320,
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
        setReady(true);
      })
      .catch(() => onError?.('Could not load Google sign-in. Check your network.'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function handleCredential(resp: { credential?: string }) {
    if (!resp?.credential) return;
    setLoading(true);
    onError?.('');
    try {
      const r = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ credential: resp.credential }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        onError?.(j?.message || mapErr(j?.error));
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      onError?.('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[color:var(--border,rgba(255,255,255,0.1))] text-sm text-[color:var(--muted)]">
          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
          {mode === 'signup' ? 'Signing up with Google…' : 'Signing in with Google…'}
        </div>
      ) : (
        <div ref={btnRef} className="w-full flex justify-center min-h-[44px] [&>div]:!w-full [&>div>div]:!w-full" aria-hidden={!ready} />
      )}
    </div>
  );
}

function mapErr(code?: string): string {
  switch (code) {
    case 'invalid_google_token': return 'Google did not accept that sign-in. Please try again.';
    case 'token_audience_mismatch': return 'Google sign-in is misconfigured. Please contact support.';
    case 'email_not_verified': return 'Your Google account email is not verified.';
    case 'missing_credential': return 'Google did not return a credential. Please try again.';
    default: return 'Google sign-in failed. Please try again.';
  }
}
