# DeepGate

OpenAI-compatible reseller for **DeepSeek V4 Flash** (positioned as unlimited) and **DeepSeek V4 Pro**, with email auth, API key management, usage tracking, INR billing via Razorpay, and a developer dashboard. Built on Next.js 16 (App Router) + Supabase Postgres.

## Architecture

- **Framework**: Next.js 16 + React 19, TypeScript, TailwindCSS v4
- **DB**: Supabase Postgres (existing actionbot project, isolated `deepgate` schema)
- **Auth**: Email + password (bcrypt), JWT in httpOnly cookie via `jose`
- **Payments**: Razorpay (with stub-success fallback when keys are absent)
- **Hosting**: Railway (Nixpacks autodetect Next.js)
- **Upstream LLM provider**: configurable via `UPSTREAM_PROVIDER`

## Upstream path: Ollama Cloud (chosen)

Both paths verified live before scaffolding. Ollama Cloud chosen because the flat ₹1,957/mo upstream lets us honestly market V4 Flash as unlimited; per-token DeepSeek-direct could not.

| Public id              | Ollama upstream                | DeepSeek upstream    |
|------------------------|--------------------------------|----------------------|
| `deepseek-v4-flash`    | `deepseek-v4-flash:cloud`      | `deepseek-chat`      |
| `deepseek-v4-pro`      | `deepseek-v4-pro:cloud`        | `deepseek-reasoner`  |

To swap to DeepSeek direct (e.g., if Ollama bans the account), only `UPSTREAM_PROVIDER=deepseek`, `UPSTREAM_API_KEY`, `UPSTREAM_BASE_URL=https://api.deepseek.com/v1` change. **If you do, introduce a fair-use cap on Flash before re-marketing it as unlimited** — per-token upstream + literally-unlimited will bleed money on power users.

## Pricing

| Item              | Price (INR)                                          |
|-------------------|------------------------------------------------------|
| Free trial        | ₹0 — 100K tokens, 7 days                             |
| Starter           | ₹1,999/month — unlimited V4 Flash + 3M Pro tokens, 60 RPM on Pro |
| Top-up: 1M Pro    | ₹500                                                 |
| Top-up: 2.5M Pro  | ₹1,000                                               |
| Top-up: 15M Pro   | ₹5,000                                               |

Per-token retail (used for cost reporting + Pro-token deduction):

| Model      | In (₹/M) | Out (₹/M) |
|------------|----------|-----------|
| V4 Flash   | 6        | 12        |
| V4 Pro     | 23       | 92        |

Roughly half of OpenRouter retail across the v3.1/v4 family. Adjust in `lib/models.ts` if OR pricing shifts.

## Environment

See `.env.example`. Production requires:

- `DATABASE_URL` (Supabase pooler URL with `?pgbouncer=true`)
- `JWT_SECRET` (≥ 64 chars random)
- `UPSTREAM_PROVIDER` = `ollama` (default) or `deepseek`
- `UPSTREAM_API_KEY` and `UPSTREAM_BASE_URL`
- `NEXT_PUBLIC_APP_URL` (used in the dashboard quick-start snippet)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (optional — stub-success used when missing)

## Schema

Migrations live in `migrations/0001_init.sql`. Apply with:

```bash
psql "$DATABASE_URL" -f migrations/0001_init.sql
```

Tables (in `deepgate` schema): `users`, `api_keys`, `usage_logs`, `payments`, `rate_limits`.

## API surface

| Method   | Path                                  | Notes                          |
|----------|---------------------------------------|--------------------------------|
| POST     | `/v1/chat/completions`                | OpenAI-compat, `stream:true` ok |
| GET      | `/v1/models`                          | lists `deepseek-v4-flash`, `deepseek-v4-pro` |
| GET      | `/api/health`                         | DB ping                         |
| POST     | `/api/auth/{signup,login,logout}`     | JSON body                       |
| GET/POST | `/api/keys`, DELETE `/api/keys/[id]`  | session-protected               |
| GET      | `/api/usage`                          | session-protected               |
| POST     | `/api/billing/checkout`               | creates Razorpay order or stubs |
| POST     | `/api/billing/verify`                 | HMAC-verifies signature         |
| GET      | `/api/billing/history`                | session-protected               |

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in
npm run build && npm start   # or: npm run dev
```

## Known risks

- **Single shared Ollama Pro account.** The same upstream key powers FlashAPI and openclaw. Compounding traffic raises ban risk. Spin up a second Ollama Pro account before driving real volume.
- **"Unlimited" only holds while upstream stays flat-fee.** Don't switch to DeepSeek direct without adding a fair-use cap.
- **No Google OAuth in v1.** Reusing actionbot's Supabase project means its OAuth client is configured for actionbot domains. Adding DeepGate as an allowed redirect is one dashboard click; v1 ships email/password only to keep launch surface small.
