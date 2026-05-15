import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { fulfill } from '../../billing/checkout/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin-only: verify a pending UPI payment and credit the user's plan / tokens.
export async function POST(req: NextRequest) {
  const admin = await getSessionUser();
  if (!admin || !admin.is_admin) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body: { paymentId?: string; action?: 'verify' | 'reject' };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
  if (!body.paymentId) return Response.json({ error: 'missing_payment_id' }, { status: 400 });
  const action = body.action === 'reject' ? 'reject' : 'verify';

  const rows = await q<{ id: string; user_id: string; plan_or_topup: string; status: string }>(
    `SELECT id, user_id, plan_or_topup, status FROM deepgate.payments WHERE id = $1`,
    [body.paymentId]
  );
  if (!rows.length) return Response.json({ error: 'payment_not_found' }, { status: 404 });
  const p = rows[0];
  if (p.status !== 'pending') return Response.json({ error: 'not_pending', status: p.status }, { status: 409 });

  if (action === 'reject') {
    await q(`UPDATE deepgate.payments SET status = 'rejected' WHERE id = $1`, [p.id]);
    return Response.json({ ok: true, status: 'rejected' });
  }

  await q(`UPDATE deepgate.payments SET status = 'captured', verified_at = now() WHERE id = $1`, [p.id]);
  await fulfill(p.user_id, p.plan_or_topup);
  return Response.json({ ok: true, status: 'captured' });
}
