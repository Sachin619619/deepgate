import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const { id } = await ctx.params;
  await q(
    `UPDATE deepgate.api_keys SET revoked_at = now() WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [id, u.id]
  );
  return Response.json({ ok: true });
}
