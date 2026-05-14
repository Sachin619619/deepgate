import { SiteNav, SiteFooter } from '@/components/site-nav';

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="max-w-3xl mx-auto px-5 py-16 prose-invert">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="text-[color:var(--muted)] mt-2 text-sm">Last updated: {new Date().toISOString().slice(0,10)}</p>
        <div className="space-y-5 mt-8 text-[color:var(--text)] leading-relaxed">
          <p>By using DeepGate (&quot;Service&quot;) you agree to these Terms. The Service resells access to third-party large language models, currently DeepSeek V4 Flash and DeepSeek V4 Pro, via an OpenAI-compatible HTTP API.</p>
          <h2 className="text-xl font-semibold mt-8">1. Account &amp; Acceptable use</h2>
          <p>You are responsible for activity under your API keys. Do not use the Service for content that is illegal, infringes intellectual property, or violates the upstream model providers&rsquo; usage policies. We may suspend accounts that abuse the Service.</p>
          <h2 className="text-xl font-semibold mt-8">2. Subscriptions &amp; refunds</h2>
          <p>Starter is billed monthly in INR. You may cancel at any time; cancellation prevents the next renewal. Top-ups are one-time and non-refundable once tokens are credited.</p>
          <h2 className="text-xl font-semibold mt-8">3. Service availability</h2>
          <p>We aim for high availability but do not guarantee uptime. The Service depends on upstream providers and may be unavailable due to factors outside our control.</p>
          <h2 className="text-xl font-semibold mt-8">4. Disclaimer &amp; liability</h2>
          <p>The Service is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages arising from use of the Service. Total liability shall not exceed fees paid in the prior 30 days.</p>
          <h2 className="text-xl font-semibold mt-8">5. Changes</h2>
          <p>We may update these Terms from time to time. Continued use after changes constitutes acceptance.</p>
          <h2 className="text-xl font-semibold mt-8">6. Contact</h2>
          <p>Questions: <a className="link" href="mailto:hello@deepgate.dev">hello@deepgate.dev</a></p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
