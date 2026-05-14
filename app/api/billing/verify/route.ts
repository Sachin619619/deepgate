import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { fulfill } from '../checkout/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return Response.json({ error: 'razorpay_not_configured' }, { status: 500 });

  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return Response.json({ error: 'missing_fields' }, { status: 400 });

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected !== razorpay_signature)
    return Response.json({ error: 'invalid_signature' }, { status: 400 });

  const rows = await q<{ id: string; user_id: string; plan_or_topup: string }>(
    `UPDATE deepgate.payments
     SET status = 'captured', razorpay_payment_id = $1
     WHERE razorpay_order_id = $2 AND user_id = $3
     RETURNING id, user_id, plan_or_topup`,
    [razorpay_payment_id, razorpay_order_id, u.id]
  );
  if (!rows.length) return Response.json({ error: 'order_not_found' }, { status: 404 });

  await fulfill(u.id, rows[0].plan_or_topup);
  return Response.json({ ok: true });
}
