import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { BillingClient } from './billing-client';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Payment = {
  id: string;
  amount_inr: string;
  status: string;
  plan_or_topup: string;
  created_at: string;
};

export default async function BillingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const payments = await q<Payment>(
    `SELECT id, amount_inr::text, status, plan_or_topup, created_at
     FROM deepgate.payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [user.id]
  );
  return (
    <DashboardShell email={user.email}>
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="text-[color:var(--muted)] text-sm mt-1 mb-6">Subscribe to Starter or top up Pro tokens.</p>
      <BillingClient
        plan={user.plan}
        payments={payments.map(p => ({ ...p, amount_inr: Number(p.amount_inr) }))}
        razorpayConfigured={Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)}
      />
    </DashboardShell>
  );
}
