import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) return Response.json({ error: 'missing_fields' }, { status: 400 });

  const rows = await q<{ id: string; password_hash: string }>(
    'SELECT id, password_hash FROM deepgate.users WHERE email = $1',
    [email]
  );
  if (!rows.length) return Response.json({ error: 'invalid_credentials' }, { status: 401 });
  const ok = await verifyPassword(password, rows[0].password_hash);
  if (!ok) return Response.json({ error: 'invalid_credentials' }, { status: 401 });

  const token = await signSession(rows[0].id);
  await setSessionCookie(token);
  return Response.json({ ok: true });
}
