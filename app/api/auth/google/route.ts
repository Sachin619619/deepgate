import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { signSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();

type TokenInfo = {
  email?: string;
  email_verified?: string | boolean;
  sub?: string;
  name?: string;
  aud?: string;
  iss?: string;
};

export async function POST(req: NextRequest) {
  let body: { credential?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
  const credential = (body.credential || '').trim();
  if (!credential) return Response.json({ error: 'missing_credential' }, { status: 400 });

  // Verify the Google ID token via Google's tokeninfo endpoint
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!r.ok) return Response.json({ error: 'invalid_google_token' }, { status: 401 });
  const payload = (await r.json()) as TokenInfo;

  // Validate audience matches our client ID (when configured)
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
    return Response.json({ error: 'token_audience_mismatch' }, { status: 401 });
  }
  const verified = payload.email_verified === true || payload.email_verified === 'true';
  if (!payload.email || !verified) {
    return Response.json({ error: 'email_not_verified' }, { status: 400 });
  }
  if (!payload.sub) {
    return Response.json({ error: 'missing_subject' }, { status: 400 });
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const name = (payload.name || email.split('@')[0]).slice(0, 120);

  // Look up by google_id first, then by email
  const found = await q<{ id: string; google_id: string | null }>(
    `SELECT id, google_id FROM deepgate.users
       WHERE google_id = $1 OR email = $2
       ORDER BY (google_id = $1) DESC
       LIMIT 1`,
    [googleId, email]
  );

  let userId: string;
  if (found.length) {
    userId = found[0].id;
    if (!found[0].google_id) {
      // Existing email-password user — link the Google account.
      await q('UPDATE deepgate.users SET google_id = $1 WHERE id = $2', [googleId, userId]);
    }
  } else {
    const inserted = await q<{ id: string }>(
      `INSERT INTO deepgate.users (email, name, google_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
      [email, name, googleId]
    );
    userId = inserted[0].id;
  }

  const token = await signSession(userId);
  await setSessionCookie(token);
  return Response.json({ ok: true });
}
