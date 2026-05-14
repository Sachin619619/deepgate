import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const u = await getSessionUser();
  if (!u) return Response.json({ error: 'unauthenticated' }, { status: 401 });

  const totals = await q<{
    tokens_today: string;
    tokens_month: string;
    requests_today: string;
    requests_month: string;
    cost_month: string;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('day', now()) THEN prompt_tokens + completion_tokens END), 0)::text AS tokens_today,
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN prompt_tokens + completion_tokens END), 0)::text AS tokens_month,
       COALESCE(COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())), 0)::text AS requests_today,
       COALESCE(COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())), 0)::text AS requests_month,
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN cost_inr END), 0)::text AS cost_month
     FROM deepgate.usage_logs WHERE user_id = $1`,
    [u.id]
  );

  const byModel = await q(
    `SELECT model, SUM(prompt_tokens + completion_tokens)::int AS tokens, COUNT(*)::int AS requests
     FROM deepgate.usage_logs WHERE user_id = $1 AND created_at >= date_trunc('month', now())
     GROUP BY model ORDER BY tokens DESC`,
    [u.id]
  );

  const daily = await q(
    `SELECT date_trunc('day', created_at)::date AS day,
            SUM(prompt_tokens + completion_tokens)::int AS tokens,
            COUNT(*)::int AS requests
     FROM deepgate.usage_logs
     WHERE user_id = $1 AND created_at >= now() - interval '14 days'
     GROUP BY day ORDER BY day`,
    [u.id]
  );

  return Response.json({
    user: {
      plan: u.plan,
      plan_expires_at: u.plan_expires_at,
      trial_tokens_remaining: u.trial_tokens_remaining,
      paid_pro_tokens_remaining: u.paid_pro_tokens_remaining,
    },
    totals: totals[0],
    byModel,
    daily,
  });
}
