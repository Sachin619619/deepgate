import { q } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await q('SELECT 1');
    return Response.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return Response.json({ ok: false, error: 'db_unreachable' }, { status: 500 });
  }
}
