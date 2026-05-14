import Link from 'next/link';
import { Zap, Plug, Gauge, Shield } from 'lucide-react';
import { SiteNav, SiteFooter } from '@/components/site-nav';

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* HERO */}
        <section className="hero-bg border-b border-[color:var(--border)] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-5 pt-20 pb-24 sm:pt-32 sm:pb-36 relative">
            <div className="rise inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--muted)] border border-[color:var(--border-strong)] rounded-full px-3 py-1 mb-7 bg-[color:var(--panel)]/60 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--accent)] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[color:var(--accent)]" />
              </span>
              Now serving DeepSeek V4
            </div>
            <h1 className="rise display text-[2.5rem] sm:text-6xl lg:text-7xl font-semibold leading-[1.02] max-w-4xl">
              Unlimited DeepSeek V4 Flash.
              <br />
              <span className="bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] bg-clip-text text-transparent">Built for builders.</span>
            </h1>
            <p className="rise-2 mt-6 text-lg sm:text-xl text-[color:var(--muted)] max-w-2xl leading-relaxed">
              An OpenAI-compatible gateway. Flat <span className="text-[color:var(--text)]">&#8377;1,999</span>/month for all-you-can-eat Flash, plus V4 Pro reasoning at half of OpenRouter retail.
            </p>
            <div className="rise-3 mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn btn-primary text-base px-5 py-3">
                Start 7-day free trial
              </Link>
              <Link href="#docs" className="btn btn-ghost text-base px-5 py-3">
                Read the docs
              </Link>
            </div>
            <p className="rise-3 mt-4 text-sm text-[color:var(--muted)]">
              100,000 free tokens. No card needed. Production-ready in 60 seconds.
            </p>

            <div className="rise-3 mt-16 max-w-3xl">
              <div className="card-elev overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[color:var(--border)] bg-[color:var(--panel-2)]">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3a4453]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3a4453]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3a4453]" />
                  </div>
                  <span className="text-xs text-[color:var(--muted)] code">python</span>
                </div>
                <pre className="code text-sm p-5 overflow-x-auto leading-relaxed text-[color:var(--text)]">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://deepgate.dev/v1",
    api_key="dgk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
)

resp = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Write a haiku about CDNs"}],
)
print(resp.choices[0].message.content)`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 transition-all duration-200 hover:border-[color:var(--border-strong)] hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-lg bg-[color:var(--accent-soft)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--accent)] mb-5">
                  <f.icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-semibold tracking-tight">{f.title}</h3>
                <p className="text-sm text-[color:var(--muted)] mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-24">
            <h2 className="display text-3xl sm:text-4xl font-semibold">Pricing built for production.</h2>
            <p className="text-[color:var(--muted)] mt-3 max-w-2xl">No surprises. No credits-that-expire-in-30-days. Predictable monthly cost; pay-as-you-go on Pro.</p>

            <div className="grid lg:grid-cols-3 gap-4 mt-12">
              <div className="card p-7 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Free trial</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight display">&#8377;0</div>
                <div className="text-sm text-[color:var(--muted)] mt-1">7 days &middot; 100K tokens</div>
                <ul className="mt-7 space-y-2.5 text-sm text-[color:var(--text)]">
                  <Bullet>Both V4 Flash &amp; V4 Pro</Bullet>
                  <Bullet>OpenAI-compatible API</Bullet>
                  <Bullet>No credit card</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-ghost mt-auto pt-4 mt-6">Sign up</Link>
              </div>

              <div className="card tier-popular p-7 flex flex-col relative">
                <div className="absolute -top-3 left-7 px-2.5 py-0.5 text-xs rounded-full bg-[color:var(--accent)] text-[#04140a] font-medium">Most popular</div>
                <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">Starter</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight display">&#8377;1,999</span>
                  <span className="text-sm text-[color:var(--muted)]">/month</span>
                </div>
                <div className="text-sm text-[color:var(--muted)] mt-1">Cancel anytime</div>
                <ul className="mt-7 space-y-2.5 text-sm text-[color:var(--text)]">
                  <Bullet><b>Unlimited</b> DeepSeek V4 Flash</Bullet>
                  <Bullet>3M V4 Pro tokens / mo included</Bullet>
                  <Bullet>60 RPM on Pro &middot; no rate cap on Flash</Bullet>
                  <Bullet>Email support</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-primary mt-6">Start free trial</Link>
              </div>

              <div className="card p-7 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Pro top-ups</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight display">&#8377;500+</span>
                </div>
                <div className="text-sm text-[color:var(--muted)] mt-1">Stack on Starter for more Pro</div>
                <ul className="mt-7 space-y-2.5 text-sm text-[color:var(--text)]">
                  <Bullet>1M tokens &mdash; &#8377;500</Bullet>
                  <Bullet>2.5M tokens &mdash; &#8377;1,000</Bullet>
                  <Bullet>15M tokens &mdash; &#8377;5,000</Bullet>
                  <Bullet>Half of OpenRouter retail</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-ghost mt-6">Get keys</Link>
              </div>
            </div>
          </div>
        </section>

        {/* DOCS */}
        <section id="docs" className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="display text-3xl font-semibold">Drop-in OpenAI compatible.</h2>
              <p className="text-[color:var(--muted)] mt-3 leading-relaxed">Change two lines &mdash; <span className="kbd">base_url</span> and <span className="kbd">api_key</span> &mdash; and you&rsquo;re live. Streaming, tool-calls, JSON mode all work as expected.</p>
              <div className="mt-7 space-y-3 text-sm">
                <Row label="Endpoint" value={<span className="code text-[color:var(--text)]">https://deepgate.dev/v1</span>} />
                <Row label="Models" value={<span className="code text-[color:var(--text)]">deepseek-v4-flash, deepseek-v4-pro</span>} />
                <Row label="Auth" value={<span className="code text-[color:var(--text)]">Authorization: Bearer dgk_live_...</span>} />
                <Row label="Billing currency" value="INR (UPI / cards / net-banking)" />
              </div>
            </div>
            <div className="card-elev overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[color:var(--border)] text-xs text-[color:var(--muted)] code bg-[color:var(--panel-2)] flex items-center justify-between">
                <span>curl &mdash; streaming</span>
                <span className="text-[color:var(--accent)]">live</span>
              </div>
              <pre className="code text-sm p-5 overflow-x-auto leading-relaxed">
{`curl https://deepgate.dev/v1/chat/completions \\
  -H "Authorization: Bearer dgk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v4-flash",
    "stream": true,
    "messages": [
      {"role":"user","content":"Stream me a 4-line poem"}
    ]
  }'`}
              </pre>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="max-w-4xl mx-auto px-5 py-28 text-center">
            <h2 className="display text-3xl sm:text-5xl font-semibold">Stop counting tokens.</h2>
            <p className="text-[color:var(--muted)] mt-4 text-lg">Get back to building. Your trial starts in 60 seconds.</p>
            <div className="mt-9 inline-flex">
              <Link href="/signup" className="btn btn-primary text-base px-6 py-3 glow">Get an API key</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const FEATURES = [
  { icon: Plug, title: 'OpenAI-compatible', body: 'Use the openai SDK, langchain, llamaindex — anything that speaks OpenAI. Just swap base_url.' },
  { icon: Zap, title: 'Sub-second start', body: 'No cold starts. No quotas-per-minute games on Flash. Streams open in under 400ms.' },
  { icon: Gauge, title: 'Predictable', body: 'Flat ₹1,999/mo for unlimited Flash. Pro is metered — you only pay when you reason.' },
  { icon: Shield, title: 'Built for prod', body: 'Per-key rate limits, usage logs, and revocation. Pay with UPI, cards, or net-banking.' },
];

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] shrink-0" />
      <span>{children}</span>
    </li>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border)] pb-2.5">
      <span className="text-[color:var(--muted)]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
