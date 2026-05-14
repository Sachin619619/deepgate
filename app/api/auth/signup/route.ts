import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const name = (body.name || '').trim() || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  if (password.length < 8)
    return Response.json({ error: 'password_too_short', message: 'Password must be at least 8 characters.' }, { status: 400 });

  const existing = await q<{ id: string }>('SELECT id FROM deepgate.users WHERE email = $1', [email]);
  if (existing.length) return Response.json({ error: 'email_taken' }, { status: 409 });

  const hash = await hashPassword(password);
  const rows = await q<{ id: string }>(
    `INSERT INTO deepgate.users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id`,
    [email, name, hash]
  );
  const token = await signSession(rows[0].id);
  await setSessionCookie(token);
  return Response.json({ ok: true });
}
