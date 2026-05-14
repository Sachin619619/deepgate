'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } }
}

type Payment = { id: string; amount_inr: number; status: string; plan_or_topup: string; created_at: string };

const TOPUPS = [
  { id: 'small',  label: '1M Pro tokens',   priceInr: 500  },
  { id: 'medium', label: '2.5M Pro tokens', priceInr: 1000 },
  { id: 'large',  label: '15M Pro tokens',  priceInr: 5000 },
];

export function BillingClient({ plan, payments, razorpayConfigured }: { plan: string; payments: Payment[]; razorpayConfigured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!razorpayConfigured) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, [razorpayConfigured]);

  async function buy(kind: 'plan' | 'topup', id: string) {
    setBusy(`${kind}:${id}`); setMsg(null);
    const r = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, id }),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || 'failed'); setBusy(null); return; }

    if (j.stub) {
      setMsg('Payment simulated successfully (Razorpay test mode disabled). Plan / tokens credited.');
      setBusy(null);
      router.refresh();
      return;
    }

    if (!window.Razorpay) {
      setMsg('Razorpay SDK not loaded yet. Try again in a second.');
      setBusy(null);
      return;
    }

    const rp = new window.Razorpay({
      key: j.keyId,
      amount: j.amount,
      currency: j.currency,
      order_id: j.orderId,
      name: 'DeepGate',
      description: `${kind}: ${id}`,
      handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const v = await fetch('/api/billing/verify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(resp),
        });
        if (v.ok) { setMsg('Payment successful. Credited.'); router.refresh(); }
        else { setMsg('Payment verification failed.'); }
        setBusy(null);
      },
      modal: { ondismiss: () => setBusy(null) },
      theme: { color: '#5af78e' },
    });
    rp.open();
  }

  return (
    <div className="space-y-6">
      {!razorpayConfigured && (
        <div className="card p-4 text-sm" style={{ borderColor: 'rgba(255,180,84,0.4)' }}>
          <span className="text-[color:var(--warn)] font-medium">Test mode:</span>
          <span className="text-[color:var(--muted)] ml-1">Razorpay keys not set. Purchases will instantly succeed and credit your account so you can verify the flow end-to-end.</span>
        </div>
      )}
      {msg && <div className="card p-4 text-sm">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Subscription</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Starter &mdash; &#8377;1,999/mo</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>&middot; Unlimited DeepSeek V4 Flash</li>
            <li>&middot; 3M V4 Pro tokens included</li>
            <li>&middot; 60 RPM on Pro &middot; no cap on Flash</li>
          </ul>
          <button className="btn btn-primary mt-6" disabled={busy !== null} onClick={() => buy('plan', 'starter')}>
            {busy === 'plan:starter' ? 'Redirecting…' : plan === 'starter' ? 'Renew / extend' : 'Subscribe'}
          </button>
        </div>

        <div className="card p-6">
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">V4 Pro top-ups</div>
          <div className="mt-2 text-sm text-[color:var(--muted)]">One-time purchase. Stacks on any plan.</div>
          <div className="mt-4 divide-row">
            {TOPUPS.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-[color:var(--muted)]">&#8377;{t.priceInr.toLocaleString('en-US')}</div>
                </div>
                <button className="btn btn-ghost" disabled={busy !== null} onClick={() => buy('topup', t.id)}>
                  {busy === `topup:${t.id}` ? 'Redirecting…' : 'Buy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-[color:var(--border)] font-medium">Payment history</div>
        <div className="divide-row">
          {payments.length === 0 && (
            <div className="p-8 text-sm text-[color:var(--muted)] text-center">No payments yet.</div>
          )}
          {payments.map(p => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="font-medium">&#8377;{Number(p.amount_inr).toLocaleString('en-US')}</div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{p.plan_or_topup}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs uppercase tracking-widest ${p.status === 'captured' ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)]'}`}>
                  {p.status}
                </div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{new Date(p.created_at).toLocaleString('en-US')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
