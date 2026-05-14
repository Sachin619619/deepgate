import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { PLANS, TOPUPS, type TopupId } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function razorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });

  let body: { kind?: 'plan' | 'topup'; id?: string };
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

  const rp = razorpayClient();
  if (!rp) {
    // Stub mode: pretend payment succeeded immediately, fulfill, return success
    const pid = `stub_${Date.now()}`;
    await q(
      `INSERT INTO deepgate.payments (user_id, razorpay_order_id, razorpay_payment_id, amount_inr, status, plan_or_topup)
       VALUES ($1, $2, $3, $4, 'captured', $5)`,
      [u.id, pid, pid, amountInr, label]
    );
    await fulfill(u.id, label);
    return Response.json({ stub: true, success: true });
  }

  const order = await rp.orders.create({
    amount: amountInr * 100,
    currency: 'INR',
    notes: { user_id: u.id, label },
  });
  await q(
    `INSERT INTO deepgate.payments (user_id, razorpay_order_id, amount_inr, status, plan_or_topup)
     VALUES ($1, $2, $3, 'created', $4)`,
    [u.id, order.id, amountInr, label]
  );
  return Response.json({
    stub: false,
    orderId: order.id,
    amount: amountInr * 100,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

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
