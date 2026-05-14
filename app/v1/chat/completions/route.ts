import { NextRequest } from 'next/server';
import { q } from '@/lib/db';
import { hashApiKey } from '@/lib/keys';
import { findModel, MODELS_BY_ID } from '@/lib/models';
import { upstreamConfig, upstreamModelName } from '@/lib/upstream';
import { checkAndConsume } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DGUser = {
  id: string;
  plan: string;
  plan_expires_at: string;
  trial_tokens_remaining: number;
  paid_pro_tokens_remaining: number;
};

function err(status: number, code: string, message: string, type = 'invalid_request_error') {
  return new Response(JSON.stringify({ error: { message, type, code } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function authenticate(req: NextRequest): Promise<{ user: DGUser; apiKeyId: string } | Response> {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(dgk_live_[A-Za-z0-9]+)$/);
  if (!m) return err(401, 'invalid_api_key', 'Missing or invalid API key. Use Authorization: Bearer dgk_live_...', 'authentication_error');
  const hash = hashApiKey(m[1]);
  const rows = await q<{ id: string; user_id: string }>(
    `UPDATE deepgate.api_keys SET last_used_at = now()
     WHERE key_hash = $1 AND revoked_at IS NULL
     RETURNING id, user_id`,
    [hash]
  );
  if (!rows.length) return err(401, 'invalid_api_key', 'API key invalid or revoked.', 'authentication_error');
  const userRows = await q<DGUser>(
    `SELECT id, plan, plan_expires_at, trial_tokens_remaining, paid_pro_tokens_remaining
     FROM deepgate.users WHERE id = $1`,
    [rows[0].user_id]
  );
  if (!userRows.length) return err(401, 'invalid_api_key', 'User missing.', 'authentication_error');
  return { user: userRows[0], apiKeyId: rows[0].id };
}

function quotaCheck(user: DGUser, modelTier: 'flash' | 'pro'): { ok: boolean; reason?: string } {
  const trialActive = user.plan === 'trial' && new Date(user.plan_expires_at) > new Date();
  const starterActive = user.plan === 'starter' && new Date(user.plan_expires_at) > new Date();

  if (trialActive) {
    if (user.trial_tokens_remaining <= 0)
      return { ok: false, reason: 'Trial exhausted. Upgrade to Starter at /billing.' };
    return { ok: true };
  }
  if (starterActive) {
    if (modelTier === 'flash') return { ok: true };
    // pro requires paid_pro_tokens_remaining
    if (user.paid_pro_tokens_remaining <= 0)
      return { ok: false, reason: 'V4 Pro quota exhausted. Buy a top-up at /billing.' };
    return { ok: true };
  }
  return { ok: false, reason: 'No active plan. Start a trial or subscribe at /billing.' };
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const authed = await authenticate(req);
  if (authed instanceof Response) return authed;
  const { user, apiKeyId } = authed;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err(400, 'invalid_json', 'Request body must be JSON');
  }

  const requestedModel = String(body.model || '');
  const model = findModel(requestedModel);
  if (!model)
    return err(
      400,
      'model_not_found',
      `Unknown model "${requestedModel}". Available: ${Object.keys(MODELS_BY_ID).join(', ')}`
    );

  const quota = quotaCheck(user, model.tier);
  if (!quota.ok) return err(402, 'quota_exhausted', quota.reason!, 'insufficient_quota');

  // Rate limit: starter flash unlimited; starter pro 60/min; trial 30/min any
  const limit = user.plan === 'trial' ? 30 : model.tier === 'flash' ? 0 : 60;
  if (limit > 0) {
    const r = await checkAndConsume(user.id, model.id, limit);
    if (!r.ok)
      return new Response(
        JSON.stringify({ error: { message: 'Rate limit exceeded.', type: 'rate_limit_error', code: 'rate_limited' } }),
        { status: 429, headers: { 'content-type': 'application/json', 'retry-after': String(r.retryAfter ?? 30) } }
      );
  }

  const stream = body.stream === true;
  const upstream = upstreamConfig();
  const upstreamBody = { ...body, model: upstreamModelName(model) };

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(`${upstream.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${upstream.apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (e) {
    return err(502, 'upstream_unreachable', 'Upstream provider unreachable', 'api_error');
  }

  if (!upstreamResp.ok || !upstreamResp.body) {
    const txt = await upstreamResp.text().catch(() => '');
    // Don't leak upstream details
    return err(
      upstreamResp.status >= 500 ? 502 : 400,
      'upstream_error',
      upstreamResp.status === 429 ? 'Upstream rate limited, retry shortly.' : 'Upstream error.',
      'api_error'
    );
  }

  if (!stream) {
    const data = await upstreamResp.json();
    const usage = (data?.usage ?? {}) as { prompt_tokens?: number; completion_tokens?: number };
    await logUsage(user.id, apiKeyId, model.id, usage.prompt_tokens || 0, usage.completion_tokens || 0, Date.now() - t0, user, model.tier);
    // Re-stamp the model name back to friendly id for client
    data.model = model.id;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Streaming SSE
  const reader = upstreamResp.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let promptTokens = 0;
  let completionTokens = 0;
  let buf = '';

  const ts = new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) {
        controller.close();
        await logUsage(user.id, apiKeyId, model.id, promptTokens, completionTokens, Date.now() - t0, user, model.tier);
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      buf += chunk;
      // Try to extract usage from any data: {...} line
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const payload = line.slice(5).trim();
          if (payload && payload !== '[DONE]') {
            try {
              const j = JSON.parse(payload);
              if (j?.usage?.prompt_tokens) promptTokens = j.usage.prompt_tokens;
              if (j?.usage?.completion_tokens) completionTokens = j.usage.completion_tokens;
            } catch {}
          }
        }
      }
      controller.enqueue(encoder.encode(chunk));
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(ts, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}

async function logUsage(
  userId: string,
  apiKeyId: string,
  modelId: string,
  pTok: number,
  cTok: number,
  latencyMs: number,
  user: DGUser,
  tier: 'flash' | 'pro'
) {
  const meta = MODELS_BY_ID[modelId];
  const cost = ((pTok * meta.priceInPerM) + (cTok * meta.priceOutPerM)) / 1_000_000;
  try {
    await q(
      `INSERT INTO deepgate.usage_logs (user_id, api_key_id, model, prompt_tokens, completion_tokens, cost_inr, latency_ms)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, apiKeyId, modelId, pTok, cTok, cost, latencyMs]
    );
    // Decrement quota
    const totalTok = pTok + cTok;
    if (user.plan === 'trial') {
      await q(
        `UPDATE deepgate.users SET trial_tokens_remaining = GREATEST(0, trial_tokens_remaining - $1) WHERE id = $2`,
        [totalTok, userId]
      );
    } else if (user.plan === 'starter' && tier === 'pro') {
      await q(
        `UPDATE deepgate.users SET paid_pro_tokens_remaining = GREATEST(0, paid_pro_tokens_remaining - $1) WHERE id = $2`,
        [totalTok, userId]
      );
    }
  } catch (e) {
    console.error('usage log failed', e);
  }
}
