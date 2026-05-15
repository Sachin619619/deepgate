import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { PLANS, TOPUPS, type TopupId } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manual UPI billing (ActionBot-style): the user pays to the UPI VPA and
// submits the transaction reference. The payment is recorded as `pending`
// and an admin verifies it before the plan / tokens are credited.
export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });

  let body: { kind?: 'plan' | 'topup'; id?: string; transactionId?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }

  let amountInr = 0;
  let label = '';
  if (body.kind === 'plan' && body.id === 'starter') {
    amountInr = PLANS.starter.priceInr;
    label = 'plan:starter';
  } else if (body.kind === 'topup' && body.id && TOPUPS[body.id as TopupId]) {
    const t = TOPUPS[body.id as TopupId];
    amountInr = t.priceInr;
    label = `topup:${t.id}`;
  } else {
    return Response.json({ error: 'invalid_product' }, { status: 400 });
  }

  const txn = (body.transactionId || '').trim();
  if (txn.length < 4)
    return Response.json({ error: 'invalid_transaction_id', message: 'Enter the UPI transaction / reference ID from your payment app.' }, { status: 400 });

  const rows = await q<{ id: string }>(
    `INSERT INTO deepgate.payments (user_id, amount_inr, status, plan_or_topup, provider, transaction_id)
     VALUES ($1, $2, 'pending', $3, 'upi', $4) RETURNING id`,
    [u.id, amountInr, label, txn]
  );
  return Response.json({ ok: true, paymentId: rows[0].id });
}

// Credit a verified payment's plan / tokens. Called by the admin verify route.
export async function fulfill(userId: string, label: string) {
  if (label === 'plan:starter') {
    await q(
      `UPDATE deepgate.users
       SET plan = 'starter',
           plan_expires_at = GREATEST(plan_expires_at, now()) + interval '30 days',
           paid_pro_tokens_remaining = paid_pro_tokens_remaining + $2
       WHERE id = $1`,
      [userId, PLANS.starter.proIncludedTokens]
    );
  } else if (label.startsWith('topup:')) {
    const tid = label.split(':')[1] as TopupId;
    const t = TOPUPS[tid];
    if (t) {
      await q(
        `UPDATE deepgate.users SET paid_pro_tokens_remaining = paid_pro_tokens_remaining + $2 WHERE id = $1`,
        [userId, t.proTokens]
      );
    }
  }
}
