import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { q } from '@/lib/db';
import { formatINR, formatNumber } from '@/lib/utils';
import { UsageChart } from '@/components/usage-chart';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const [totals] = await q<{
    tokens_today: string; tokens_month: string;
    requests_today: string; requests_month: string;
    cost_month: string;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('day', now()) THEN prompt_tokens + completion_tokens END), 0)::text AS tokens_today,
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN prompt_tokens + completion_tokens END), 0)::text AS tokens_month,
       COALESCE(COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())), 0)::text AS requests_today,
       COALESCE(COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())), 0)::text AS requests_month,
       COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN cost_inr END), 0)::text AS cost_month
     FROM deepgate.usage_logs WHERE user_id = $1`,
    [user.id]
  );

  const daily = await q<{ day: string; tokens: number; requests: number }>(
    `SELECT to_char(date_trunc('day', created_at), 'Mon DD') AS day,
            SUM(prompt_tokens + completion_tokens)::int AS tokens,
            COUNT(*)::int AS requests
     FROM deepgate.usage_logs
     WHERE user_id = $1 AND created_at >= now() - interval '14 days'
     GROUP BY date_trunc('day', created_at) ORDER BY date_trunc('day', created_at)`,
    [user.id]
  );

  const byModel = await q<{ model: string; tokens: number; requests: number }>(
    `SELECT model, SUM(prompt_tokens + completion_tokens)::int AS tokens, COUNT(*)::int AS requests
     FROM deepgate.usage_logs WHERE user_id = $1 AND created_at >= date_trunc('month', now())
     GROUP BY model ORDER BY tokens DESC`,
    [user.id]
  );

  const trialActive = user.plan === 'trial' && new Date(user.plan_expires_at) > new Date();
  const daysLeft = Math.max(0, Math.ceil((new Date(user.plan_expires_at).getTime() - Date.now()) / 86400000));

  return (
    <DashboardShell email={user.email}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-[color:var(--muted)] text-sm mt-1">Your usage at a glance.</p>
        </div>
        <Link href="/billing" className="btn btn-primary">
          {trialActive ? 'Upgrade to Starter' : 'Manage billing'}
        </Link>
      </div>

      {/* Plan */}
      <div className="card p-5 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Plan</div>
          <div className="mt-1 text-lg font-medium capitalize">{user.plan}</div>
        </div>
        {trialActive ? (
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Trial tokens</div>
            <div className="mt-1 text-lg font-medium">{formatNumber(user.trial_tokens_remaining)} <span className="text-[color:var(--muted)] text-sm">/ 100,000 left</span></div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">{daysLeft} day{daysLeft === 1 ? '' : 's'} remaining</div>
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Pro tokens left</div>
            <div className="mt-1 text-lg font-medium">{formatNumber(user.paid_pro_tokens_remaining)}</div>
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Renews / expires</div>
          <div className="mt-1 text-lg font-medium">{new Date(user.plan_expires_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Stat label="Tokens today" value={formatNumber(Number(totals.tokens_today))} />
        <Stat label="Tokens this month" value={formatNumber(Number(totals.tokens_month))} />
        <Stat label="Requests this month" value={formatNumber(Number(totals.requests_month))} />
        <Stat label="Cost this month" value={formatINR(Number(totals.cost_month))} sub="based on per-token retail" />
      </div>

      {/* Chart + breakdown */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Last 14 days</h2>
            <span className="text-xs text-[color:var(--muted)]">tokens / day</span>
          </div>
          <div className="mt-4 h-64">
            <UsageChart data={daily.map(d => ({ day: d.day, tokens: d.tokens }))} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight">By model (this month)</h2>
          <div className="mt-4 divide-row">
            {byModel.length === 0 && <div className="text-sm text-[color:var(--muted)]">No traffic yet — try the snippet on the right.</div>}
            {byModel.map(m => (
              <div key={m.model} className="flex justify-between py-2.5 text-sm">
                <span className="code">{m.model}</span>
                <span className="text-[color:var(--muted)]">{formatNumber(m.tokens)} tok &middot; {formatNumber(m.requests)} req</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick start */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight">Quick start</h2>
          <p className="text-sm text-[color:var(--muted)] mt-1">Generate a key in API keys, then drop into your stack.</p>
          <pre className="code text-xs sm:text-sm mt-4 p-4 bg-[color:var(--panel-2)] rounded-lg overflow-x-auto leading-relaxed">
{`from openai import OpenAI

client = OpenAI(
    base_url="${process.env.NEXT_PUBLIC_APP_URL || ''}/v1",
    api_key="dgk_live_...",
)

print(client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role":"user","content":"hello"}],
).choices[0].message.content)`}
          </pre>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold tracking-tight">Models</h2>
          <div className="mt-4 divide-row">
            <ModelRow id="deepseek-v4-flash" name="DeepSeek V4 Flash" tier="Unlimited on Starter" pricing="₹6 in / ₹12 out per M" />
            <ModelRow id="deepseek-v4-pro" name="DeepSeek V4 Pro" tier="Reasoning &middot; metered" pricing="₹23 in / ₹92 out per M" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-[color:var(--muted)] mt-1">{sub}</div>}
    </div>
  );
}

function ModelRow({ id, name, tier, pricing }: { id: string; name: string; tier: string; pricing: string }) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-baseline">
        <div className="font-medium">{name}</div>
        <span className="code text-xs text-[color:var(--muted)]">{id}</span>
      </div>
      <div className="text-xs text-[color:var(--muted)] mt-0.5" dangerouslySetInnerHTML={{ __html: tier }} />
      <div className="text-xs text-[color:var(--muted)] mt-0.5">{pricing}</div>
    </div>
  );
}
