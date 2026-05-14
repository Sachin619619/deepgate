'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function UsageChart({ data }: { data: { day: string; tokens: number }[] }) {
  if (!data.length) {
    return <div className="h-full flex items-center justify-center text-sm text-[color:var(--muted)]">No usage in the last 14 days.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5af78e" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#5af78e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f2733" vertical={false} />
        <XAxis dataKey="day" stroke="#8b95a5" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis stroke="#8b95a5" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0f141c', border: '1px solid #1f2733', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#8b95a5' }}
          formatter={(v) => [Number(v ?? 0).toLocaleString('en-IN'), 'tokens']}
        />
        <Area type="monotone" dataKey="tokens" stroke="#5af78e" strokeWidth={2} fill="url(#g1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
