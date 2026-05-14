import { SiteNav, SiteFooter } from '@/components/site-nav';

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-[color:var(--muted)] mt-2 text-sm">Last updated: {new Date().toISOString().slice(0,10)}</p>
        <div className="space-y-5 mt-8 text-[color:var(--text)] leading-relaxed">
          <p>This policy explains how DeepGate handles your data.</p>
          <h2 className="text-xl font-semibold mt-8">Data we collect</h2>
          <ul className="list-disc pl-6 space-y-1 text-[color:var(--muted)]">
            <li>Account email and password hash (bcrypt) for authentication.</li>
            <li>API key metadata: name, hashed key, timestamps.</li>
            <li>Per-request usage metadata: model, token counts, latency, timestamp. We do not retain prompt or completion content.</li>
            <li>Payment transaction IDs from Razorpay (no card numbers).</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8">Upstream providers</h2>
          <p>Requests are forwarded to upstream model providers (Ollama Cloud or DeepSeek). Their handling of prompts is governed by their respective privacy policies. Do not send sensitive personal data through the Service unless you accept the upstream provider&rsquo;s terms.</p>
          <h2 className="text-xl font-semibold mt-8">Cookies</h2>
          <p>We use a single httpOnly session cookie for authentication. No third-party tracking.</p>
          <h2 className="text-xl font-semibold mt-8">Deletion</h2>
          <p>Email <a className="link" href="mailto:hello@deepgate.dev">hello@deepgate.dev</a> to request account deletion.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
