import { q } from './db';

// Token-bucket-ish: 1-minute fixed window per (user, model).
export async function checkAndConsume(
  userId: string,
  model: string,
  limitPerMinute: number
): Promise<{ ok: boolean; remaining: number; retryAfter?: number }> {
  if (limitPerMinute <= 0) return { ok: true, remaining: Number.POSITIVE_INFINITY };

  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / 60_000) * 60_000);

  const rows = await q<{ request_count: number }>(
    `INSERT INTO deepgate.rate_limits (user_id, model, window_start, request_count)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (user_id, model) DO UPDATE
       SET window_start = CASE WHEN deepgate.rate_limits.window_start = EXCLUDED.window_start
                               THEN deepgate.rate_limits.window_start ELSE EXCLUDED.window_start END,
           request_count = CASE WHEN deepgate.rate_limits.window_start = EXCLUDED.window_start
                                THEN deepgate.rate_limits.request_count + 1 ELSE 1 END
     RETURNING request_count`,
    [userId, model, windowStart.toISOString()]
  );
  const count = rows[0]?.request_count ?? 1;
  if (count > limitPerMinute) {
    const retry = Math.max(1, Math.ceil((windowStart.getTime() + 60_000 - now.getTime()) / 1000));
    return { ok: false, remaining: 0, retryAfter: retry };
  }
  return { ok: true, remaining: limitPerMinute - count };
}
