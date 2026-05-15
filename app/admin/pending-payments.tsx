'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type Pending = {
  id: string;
  email: string;
  amount_inr: string;
  plan_or_topup: string;
  transaction_id: string | null;
  created_at: string;
};

export function PendingPayments({ pending }: { pending: Pending[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());

  async function act(id: string, action: 'verify' | 'reject') {
    setBusy(id);
    const r = await fetch('/api/admin/verify-payment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentId: id, action }),
    });
    setBusy(null);
    if (r.ok) {
      setGone(prev => new Set(prev).add(id));
      router.refresh();
    }
  }

  const visible = pending.filter(p => !gone.has(p.id));

  return (
    <div className="card p-5 mt-4" style={{ borderColor: 'rgba(255,180,84,0.35)' }}>
      <h2 className="font-semibold tracking-tight">
        Pending payments to verify ({visible.length})
      </h2>
      <p className="text-xs text-[color:var(--muted)] mt-1">
        UPI payments awaiting verification. Confirm the transaction ID landed in the
        DeepGate UPI account, then verify to credit the plan / tokens.
      </p>
      <div className="mt-4 divide-row">
        {visible.length === 0 && (
          <div className="text-sm text-[color:var(--muted)] py-2">Nothing pending.</div>
        )}
        {visible.map(p => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium break-all">{p.email}</div>
              <div className="text-xs text-[color:var(--muted)] mt-0.5">
                ₹{Number(p.amount_inr).toLocaleString('en-US')} · {p.plan_or_topup} ·
                txn <span className="code">{p.transaction_id || '—'}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                className="btn btn-primary py-1.5 text-sm"
                disabled={busy === p.id}
                onClick={() => act(p.id, 'verify')}
              >
                {busy === p.id ? '…' : 'Verify'}
              </button>
              <button
                className="btn btn-ghost py-1.5 text-sm"
                disabled={busy === p.id}
                onClick={() => act(p.id, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
