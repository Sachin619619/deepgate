# DeepGate — Deployment

## Live URL

**https://deepgate-production.up.railway.app**

## Where it runs

- **Railway project**: `actionbot-api` (id `134423bd-7c85-441d-ae3e-952ee32e88bc`) — DeepGate is the third service alongside `actionbot-api` and `flashapi`.
- **Service id**: `3e8a1070-4432-41df-a1ef-0b6bcc466d1a`
- **Environment**: `production` (id `f6d2447b-5053-4c48-9701-f932771cbe2b`)
- **Auto-deploys**: on push to `main` (Railway GitHub App watches the repo).
- **Region**: AWS ap-south-1 (Mumbai), same as Supabase.

## GitHub repo

**https://github.com/Sachin619619/deepgate**  (public — Railway GitHub App is scoped to actionbot only, so making this repo public was the path of least resistance to let Railway clone it. The `flashapi` repo uses the same workaround. **Verified zero secrets in git** — all secrets are in `.env.local` which is gitignored.)

## Database

- **Supabase project**: `zefcwqvwrwrlbxulbdyb` (existing actionbot project)
- **Schema**: `deepgate` (isolated from actionbot tables)
- **Migration**: `migrations/0001_init.sql` — already applied
- **Connection**: pooler (`aws-1-ap-south-1.pooler.supabase.com:6543`) with `?pgbouncer=true`

## Production env vars (set on Railway service)

```
DATABASE_URL=postgresql://postgres.zefcwqvwrwrlbxulbdyb:ActionBot2026Secure!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=deepgate-prod-jwt-2026-J7fL3xqV9aT2bP6mZk1NwYsR8cE4uHdQ-very-long-secret-rotate-after-launch
UPSTREAM_PROVIDER=ollama
UPSTREAM_API_KEY=0f7e6f3e98ed4b35a61a0afadb039516.7SGxTPUHewoGMKT_jLYm2TlZ
UPSTREAM_BASE_URL=https://ollama.com/v1
NEXT_PUBLIC_APP_URL=https://deepgate-production.up.railway.app
NODE_ENV=production
PORT=3000
```

(Razorpay keys deliberately omitted — billing runs in stub-success mode until real keys are added.)

## E2E smoke test results (2026-05-14)

Performed against the live URL right after first deploy:

| Step | Result |
|------|--------|
| `GET /api/health` | HTTP 200, DB reachable |
| `GET /v1/models` | HTTP 200, lists `deepseek-v4-flash` and `deepseek-v4-pro` |
| `POST /api/auth/signup` | created user with 100K trial tokens, 7-day expiry |
| `POST /api/keys` | issued `dgk_live_…`, only returned plaintext once |
| `POST /v1/chat/completions` (non-stream) | HTTP 200, model returned correct content |
| `POST /v1/chat/completions` (stream) | SSE chunks streaming as expected |
| Invalid bearer token | HTTP 401, OpenAI-shaped error JSON |
| `GET /dashboard` (no session) | 307 → `/login` |
| `GET /dashboard` (with session) | rendered Overview / Plan / Tokens today |
| Trial tokens decremented in DB | yes — 100,000 → 99,967 after 33 prompt+completion tokens |
| Usage row written to `deepgate.usage_logs` | yes, with model, tokens, cost INR, latency |

Smoke user cleaned up post-test.

## Re-deploy

A push to `main` triggers an auto deploy. To force a manual one:

```bash
RAILWAY_TOKEN="6f9f3312-7dd3-4c21-b0d4-477289ac5755"
SERVICE="3e8a1070-4432-41df-a1ef-0b6bcc466d1a"
ENV="f6d2447b-5053-4c48-9701-f932771cbe2b"
SHA=$(git rev-parse HEAD)
curl -sS -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { serviceInstanceDeployV2(serviceId: \\\"$SERVICE\\\", environmentId: \\\"$ENV\\\", commitSha: \\\"$SHA\\\") }\"}"
```

## Adding a custom domain (when ready)

1. Buy domain (e.g. `deepgate.dev` via Vercel, Porkbun, or wherever).
2. In Railway dashboard: Service → Settings → Networking → Add custom domain → enter `deepgate.dev`.
3. Set the CNAME at your DNS provider as Railway prompts.
4. Update `NEXT_PUBLIC_APP_URL` env var to `https://deepgate.dev`, redeploy.

## Switching to real Razorpay (when ready)

1. Get live keys from Razorpay dashboard (account currently onboarded under `sachhuap619@gmail.com` — see `reference_razorpay_setup.md`).
2. Set on Railway service:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   ```
3. Redeploy. Stub mode auto-disables; checkout will create real Razorpay orders and verify HMAC signatures on `/api/billing/verify`.
