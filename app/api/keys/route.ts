import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { generateApiKey } from '@/lib/keys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const rows = await q(
    `SELECT id, name, key_prefix, created_at, last_used_at, revoked_at
     FROM deepgate.api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
    [u.id]
  );
  return Response.json({ keys: rows });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  let body: { name?: string };
  try { body = await req.json(); } catch { body = {}; }
  const name = (body.name || 'Default').trim().slice(0, 60);
  const { full, prefix, hash } = generateApiKey();
  const rows = await q<{ id: string }>(
    `INSERT INTO deepgate.api_keys (user_id, name, key_hash, key_prefix)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [u.id, name, hash, prefix]
  );
  return Response.json({ id: rows[0].id, name, key: full, prefix });
}
