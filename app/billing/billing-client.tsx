'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

type Payment = {
  id: string;
  amount_inr: number;
  status: string;
  plan_or_topup: string;
  created_at: string;
};

const UPI_VPA = '8892162090@ybl';
const PAYEE = 'DeepGate';

const BANK = {
  name: 'SACHIN A PASHUPATIHAL',
  account: '50100161771983',
  ifsc: 'HDFC0004251',
  bank: 'HDFC Bank',
  branch: 'Magadi Road',
};

const PRODUCTS = {
  'plan:starter': { label: 'Starter plan', priceInr: 1999, kind: 'plan' as const, id: 'starter' },
  'topup:small':  { label: '1M Pro tokens',   priceInr: 500,  kind: 'topup' as const, id: 'small' },
  'topup:medium': { label: '2.5M Pro tokens', priceInr: 1000, kind: 'topup' as const, id: 'medium' },
  'topup:large':  { label: '15M Pro tokens',  priceInr: 5000, kind: 'topup' as const, id: 'large' },
};
type ProductKey = keyof typeof PRODUCTS;

const UPI_APPS = [
  { name: 'PhonePe', scheme: 'phonepe://pay' },
  { name: 'Google Pay', scheme: 'tez://upi/pay' },
  { name: 'Paytm', scheme: 'paytmmp://pay' },
  { name: 'BHIM / other', scheme: 'upi://pay' },
];

function upiUrl(scheme: string, amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_VPA, pn: PAYEE, am: String(amount), cu: 'INR', tn: note,
  });
  return `${scheme}?${params.toString()}`;
}

export function BillingClient({ plan, payments }: { plan: string; payments: Payment[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<ProductKey | null>(null);
  const [txn, setTxn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  function openModal(key: ProductKey) {
    setOpen(key); setTxn(''); setErr(''); setDone(false);
  }
  function close() {
    setOpen(null); setTxn(''); setErr(''); setDone(false);
  }

  async function submit() {
    if (!open) return;
    const p = PRODUCTS[open];
    if (txn.trim().length < 4) { setErr('Enter the UPI transaction / reference ID from your payment app.'); return; }
    setSubmitting(true); setErr('');
    const r = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: p.kind, id: p.id, transactionId: txn.trim() }),
    });
    const j = await r.json();
    setSubmitting(false);
    if (!r.ok) { setErr(j.message || j.error || 'Submission failed.'); return; }
    setDone(true);
    router.refresh();
  }

  const active = open ? PRODUCTS[open] : null;
  const note = active ? `DeepGate ${active.label}` : '';

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6 min-w-0">
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Subscription</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Starter &mdash; &#8377;1,999/mo</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>&middot; Unlimited DeepSeek V4 Flash</li>
            <li>&middot; 3M V4 Pro tokens included</li>
            <li>&middot; 60 RPM on Pro &middot; no cap on Flash</li>
          </ul>
          <button className="btn btn-primary mt-6" onClick={() => openModal('plan:starter')}>
            {plan === 'starter' ? 'Renew / extend' : 'Subscribe'}
          </button>
        </div>

        <div className="card p-6 min-w-0">
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">V4 Pro top-ups</div>
          <div className="mt-2 text-sm text-[color:var(--muted)]">One-time purchase. Stacks on any plan.</div>
          <div className="mt-4 divide-row">
            {(['topup:small', 'topup:medium', 'topup:large'] as ProductKey[]).map(k => (
              <div key={k} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-medium">{PRODUCTS[k].label}</div>
                  <div className="text-xs text-[color:var(--muted)]">&#8377;{PRODUCTS[k].priceInr.toLocaleString('en-US')}</div>
                </div>
                <button className="btn btn-ghost shrink-0" onClick={() => openModal(k)}>Buy</button>
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
              <div className="min-w-0">
                <div className="font-medium">&#8377;{Number(p.amount_inr).toLocaleString('en-US')}</div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{p.plan_or_topup}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xs uppercase tracking-widest ${
                  p.status === 'captured' ? 'text-[color:var(--accent)]'
                  : p.status === 'pending' ? 'text-[color:var(--warn)]'
                  : 'text-[color:var(--muted)]'}`}>
                  {p.status === 'captured' ? 'verified' : p.status}
                </div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{new Date(p.created_at).toLocaleString('en-US')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPI payment modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={close}
        >
          <div
            className="card w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[color:var(--panel)] px-5 pt-5 pb-3 border-b border-[color:var(--border)] flex items-center justify-between">
              <div>
                <h2 className="font-semibold tracking-tight">{active.label}</h2>
                <div className="text-sm text-[color:var(--muted)]">&#8377;{active.priceInr.toLocaleString('en-US')} via UPI</div>
              </div>
              <button onClick={close} className="btn btn-ghost py-1.5">Close</button>
            </div>

            <div className="p-5 space-y-4">
              {done ? (
                <div className="text-center py-6">
                  <div className="text-[color:var(--accent)] text-lg font-semibold">Payment submitted ✓</div>
                  <p className="text-sm text-[color:var(--muted)] mt-2">
                    Your {active.label.toLowerCase()} activates within 5 minutes of verification. You can close this window.
                  </p>
                  <button onClick={close} className="btn btn-primary mt-5">Done</button>
                </div>
              ) : (
                <>
                  {/* Step 1 — pay */}
                  <div>
                    <p className="text-sm font-semibold">Step 1 — Pay &#8377;{active.priceInr.toLocaleString('en-US')}</p>
                    <div className="mt-3 flex flex-col items-center gap-3">
                      <div className="bg-white p-3 rounded-xl">
                        <QRCodeSVG value={upiUrl('upi://pay', active.priceInr, note)} size={172} level="M" />
                      </div>
                      <div className="text-xs text-[color:var(--muted)]">Scan with any UPI app, or pay to</div>
                      <div className="code text-sm bg-[color:var(--panel-2)] rounded-lg px-3 py-1.5">{UPI_VPA}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {UPI_APPS.map(app => (
                        <a key={app.name} href={upiUrl(app.scheme, active.priceInr, note)}
                          className="btn btn-ghost text-sm justify-center">
                          {app.name}
                        </a>
                      ))}
                    </div>

                    {/* Bank transfer — for India (NEFT / IMPS / RTGS) */}
                    <div className="mt-4 border-t border-[color:var(--border)] pt-4">
                      <p className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-widest">
                        Or bank transfer (India · NEFT / IMPS)
                      </p>
                      <div className="mt-2 rounded-lg bg-[color:var(--panel-2)] divide-row text-sm">
                        <BankRow label="Account name" value={BANK.name} />
                        <BankRow label="Account number" value={BANK.account} mono />
                        <BankRow label="IFSC" value={BANK.ifsc} mono />
                        <BankRow label="Bank" value={`${BANK.bank} · ${BANK.branch}`} />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 — confirm */}
                  <div className="border-t border-[color:var(--border)] pt-4">
                    <p className="text-sm font-semibold">Step 2 — Confirm payment</p>
                    <p className="text-xs text-[color:var(--muted)] mt-1 mb-2">
                      After paying, enter the UPI transaction / reference ID from your payment app.
                    </p>
                    <input
                      type="text"
                      value={txn}
                      onChange={e => setTxn(e.target.value)}
                      placeholder="e.g. 430212345678"
                      className="w-full px-3 py-2.5 rounded-lg bg-[color:var(--panel-2)] border border-[color:var(--border)] text-sm focus:outline-none focus:border-[color:var(--accent)]"
                    />
                    {err && <p className="text-sm text-[color:var(--warn)] mt-2">{err}</p>}
                    <button
                      className="btn btn-primary w-full mt-3"
                      disabled={submitting || txn.trim().length < 4}
                      onClick={submit}
                    >
                      {submitting ? 'Submitting…' : 'Submit for verification'}
                    </button>
                    <p className="text-xs text-[color:var(--muted)] text-center mt-2">
                      Plan activates within 5 minutes of verification.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BankRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="text-[color:var(--muted)] text-xs shrink-0">{label}</span>
      <span className={`text-right break-all ${mono ? 'code' : ''}`}>{value}</span>
    </div>
  );
}
