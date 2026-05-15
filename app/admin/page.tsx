import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { q } from '@/lib/db';
import { formatINR, formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  plan_expires_at: string;
  trial_tokens_remaining: number;
  paid_pro_tokens_remaining: number;
  created_at: string;
  is_admin: boolean;
  key_count: number;
  requests: number;
  tokens: number;
  spend_inr: string;
};

type PaymentRow = {
  email: string;
  amount_inr: string;
  status: string;
  plan_or_topup: string;
  created_at: string;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!user.is_admin) redirect('/dashboard');

  const users = await q<UserRow>(
    `SELECT u.id, u.email, u.name, u.plan, u.plan_expires_at,
            u.trial_tokens_remaining, u.paid_pro_tokens_remaining, u.created_at, u.is_admin,
            COALESCE(k.cnt, 0)::int AS key_count,
            COALESCE(l.req, 0)::int AS requests,
            COALESCE(l.tok, 0)::int AS tokens,
            COALESCE(p.spend, 0)::text AS spend_inr
     FROM deepgate.users u
     LEFT JOIN (SELECT user_id, COUNT(*) cnt FROM deepgate.api_keys WHERE revoked_at IS NULL GROUP BY user_id) k ON k.user_id = u.id
     LEFT JOIN (SELECT user_id, COUNT(*) req, SUM(prompt_tokens + completion_tokens) tok FROM deepgate.usage_logs GROUP BY user_id) l ON l.user_id = u.id
     LEFT JOIN (SELECT user_id, SUM(amount_inr) spend FROM deepgate.payments WHERE status = 'captured' GROUP BY user_id) p ON p.user_id = u.id
     ORDER BY u.created_at DESC`
  );

  const [agg] = await q<{
    total: string; today: string; week: string; paying: string; revenue: string;
  }>(
    `SELECT
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::text AS today,
       COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS week,
       COUNT(*) FILTER (WHERE plan = 'starter')::text AS paying,
       (SELECT COALESCE(SUM(amount_inr), 0) FROM deepgate.payments WHERE status = 'captured')::text AS revenue
     FROM deepgate.users`
  );

  const payments = await q<PaymentRow>(
    `SELECT u.email, p.amount_inr::text, p.status, p.plan_or_topup, p.created_at
     FROM deepgate.payments p JOIN deepgate.users u ON u.id = p.user_id
     ORDER BY p.created_at DESC LIMIT 20`
  );

  return (
    <DashboardShell email={user.email} isAdmin>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-[color:var(--muted)] text-sm mt-1">All signups and account activity across DeepGate.</p>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        <Stat label="Total users" value={formatNumber(Number(agg.total))} />
        <Stat label="Signups today" value={formatNumber(Number(agg.today))} />
        <Stat label="Signups this week" value={formatNumber(Number(agg.week))} />
        <Stat label="Paying (Starter)" value={formatNumber(Number(agg.paying))} />
        <Stat label="Total revenue" value={formatINR(Number(agg.revenue))} />
      </div>

      <div className="card p-5 mt-4">
        <h2 className="font-semibold tracking-tight">All signups ({users.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[color:var(--muted)] text-xs uppercase tracking-widest">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Signed up</th>
                <th className="py-2 pr-4">Expires</th>
                <th className="py-2 pr-4">Keys</th>
                <th className="py-2 pr-4">Requests</th>
                <th className="py-2 pr-4">Tokens</th>
                <th className="py-2 pr-4">Spend</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-[color:var(--border)]">
                  <td className="py-2.5 pr-4">
                    {u.email}
                    {u.is_admin && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[color:var(--accent)]">admin</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-[color:var(--muted)]">{u.name || '—'}</td>
                  <td className="py-2.5 pr-4 capitalize">{u.plan}</td>
                  <td className="py-2.5 pr-4 text-[color:var(--muted)]">{fmtDate(u.created_at)}</td>
                  <td className="py-2.5 pr-4 text-[color:var(--muted)]">{fmtDate(u.plan_expires_at)}</td>
                  <td className="py-2.5 pr-4">{u.key_count}</td>
                  <td className="py-2.5 pr-4">{formatNumber(u.requests)}</td>
                  <td className="py-2.5 pr-4">{formatNumber(u.tokens)}</td>
                  <td className="py-2.5 pr-4">{formatINR(Number(u.spend_inr))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h2 className="font-semibold tracking-tight">Recent payments ({payments.length})</h2>
        <div className="mt-4 divide-row">
          {payments.length === 0 && <div className="text-sm text-[color:var(--muted)]">No payments yet.</div>}
          {payments.map((p, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <span>{p.email} <span className="text-[color:var(--muted)]">· {p.plan_or_topup}</span></span>
              <span className="text-[color:var(--muted)]">
                {formatINR(Number(p.amount_inr))} · {p.status} · {fmtDate(p.created_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
