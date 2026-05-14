import Link from 'next/link';
import { SiteNav, SiteFooter } from '@/components/site-nav';

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* HERO */}
        <section className="grid-bg border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--muted)] border border-[color:var(--border)] rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              Now serving DeepSeek V4
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl">
              Unlimited DeepSeek V4 Flash.
              <br />
              <span className="text-[color:var(--accent)]">Built for builders.</span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--muted)] max-w-2xl">
              An OpenAI-compatible API. &#8377;1,999/month, all-you-can-eat Flash. Plus V4 Pro
              reasoning at half of OpenRouter pricing. INR billing, low-latency from
              Mumbai.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn btn-primary text-base px-5 py-3">
                Start 7-day free trial &rarr;
              </Link>
              <Link href="#docs" className="btn btn-ghost text-base px-5 py-3">
                See API docs
              </Link>
            </div>
            <p className="mt-4 text-sm text-[color:var(--muted)]">
              100,000 free tokens. No card needed. Production-ready in 60 seconds.
            </p>

            <div className="mt-14 max-w-3xl">
              <div className="card overflow-hidden">
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

        <section className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6">
                <div className="w-9 h-9 rounded-lg bg-[color:var(--panel-2)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--accent)] mb-4 code">{f.icon}</div>
                <h3 className="font-semibold tracking-tight">{f.title}</h3>
                <p className="text-sm text-[color:var(--muted)] mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-20">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Pricing built for production.</h2>
            <p className="text-[color:var(--muted)] mt-3 max-w-2xl">No surprises. No credits-that-expire-in-30-days. Predictable monthly cost; pay-as-you-go on Pro.</p>

            <div className="grid lg:grid-cols-3 gap-4 mt-10">
              <div className="card p-7 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Free trial</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">&#8377;0</div>
                <div className="text-sm text-[color:var(--muted)] mt-1">7 days &middot; 100K tokens</div>
                <ul className="mt-6 space-y-2 text-sm text-[color:var(--text)]">
                  <Bullet>Both V4 Flash &amp; V4 Pro</Bullet>
                  <Bullet>OpenAI-compatible API</Bullet>
                  <Bullet>No credit card</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-ghost mt-auto pt-4">Sign up</Link>
              </div>

              <div className="card p-7 flex flex-col relative" style={{ borderColor: 'rgba(90,247,142,0.45)' }}>
                <div className="absolute -top-3 left-7 px-2 py-0.5 text-xs rounded bg-[color:var(--accent)] text-[#062012] font-medium">Most popular</div>
                <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">Starter</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">&#8377;1,999</span>
                  <span className="text-sm text-[color:var(--muted)]">/month</span>
                </div>
                <div className="text-sm text-[color:var(--muted)] mt-1">Cancel anytime</div>
                <ul className="mt-6 space-y-2 text-sm text-[color:var(--text)]">
                  <Bullet><b>Unlimited</b> DeepSeek V4 Flash</Bullet>
                  <Bullet>3M V4 Pro tokens / mo included</Bullet>
                  <Bullet>60 RPM on Pro &middot; no rate cap on Flash</Bullet>
                  <Bullet>Email support, India hours</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-primary mt-auto pt-4">Start free trial</Link>
              </div>

              <div className="card p-7 flex flex-col">
                <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">Pro top-ups</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">&#8377;500+</span>
                </div>
                <div className="text-sm text-[color:var(--muted)] mt-1">Stack on Starter for more Pro</div>
                <ul className="mt-6 space-y-2 text-sm text-[color:var(--text)]">
                  <Bullet>1M tokens &mdash; &#8377;500</Bullet>
                  <Bullet>2.5M tokens &mdash; &#8377;1,000</Bullet>
                  <Bullet>15M tokens &mdash; &#8377;5,000</Bullet>
                  <Bullet>Half of OpenRouter retail</Bullet>
                </ul>
                <Link href="/signup" className="btn btn-ghost mt-auto pt-4">Get keys</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="border-b border-[color:var(--border)]">
          <div className="max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Drop-in OpenAI compatible.</h2>
              <p className="text-[color:var(--muted)] mt-3">Change two lines &mdash; <span className="kbd">base_url</span> and <span className="kbd">api_key</span> &mdash; and you&rsquo;re live. Streaming, tool-calls, JSON mode all work as expected.</p>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Endpoint" value={<span className="code">https://deepgate.dev/v1</span>} />
                <Row label="Models" value={<span className="code">deepseek-v4-flash, deepseek-v4-pro</span>} />
                <Row label="Auth" value={<span className="code">Authorization: Bearer dgk_live_...</span>} />
                <Row label="Region" value="Mumbai (ap-south-1)" />
              </div>
            </div>
            <div className="card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[color:var(--border)] text-xs text-[color:var(--muted)] code bg-[color:var(--panel-2)]">curl &mdash; streaming</div>
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

        <section>
          <div className="max-w-4xl mx-auto px-5 py-24 text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Stop counting tokens.</h2>
            <p className="text-[color:var(--muted)] mt-4 text-lg">Get back to building. Your trial starts in 60 seconds.</p>
            <div className="mt-8 inline-flex">
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
  { icon: '⌁', title: 'OpenAI-compatible', body: 'Use the openai SDK, langchain, llamaindex — anything that speaks OpenAI. Just swap base_url.' },
  { icon: '⚡', title: 'Sub-second start', body: 'No cold starts, no quotas-per-minute games on Flash. Streams open in <400ms from Mumbai.' },
  { icon: '₹', title: 'Billed in INR', body: 'Pay with UPI, cards, or net-banking via Razorpay. GST invoices for your books.' },
  { icon: '◊', title: 'Predictable', body: 'Flat ₹1,999/mo for unlimited Flash. Pro is metered — you only pay when you reason.' },
];

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 items-start">
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
