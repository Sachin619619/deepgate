import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const rows = await q(
    `SELECT id, amount_inr, status, plan_or_topup, created_at
     FROM deepgate.payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [u.id]
  );
  return Response.json({ payments: rows });
}
