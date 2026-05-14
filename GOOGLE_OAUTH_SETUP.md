# Google OAuth Setup for DeepGate

DeepGate uses Google Identity Services (GIS) — the same OAuth client as ActionBot.
Client ID: `425613513915-qbheokls4nqe7fa48463ok42ef08a93v.apps.googleusercontent.com`

## ONE manual step required (Google Cloud Console)

GIS is a popup/iframe flow that uses **Authorized JavaScript Origins** (not Redirect
URIs). The button silently fails to render if the page origin isn't whitelisted on the
OAuth client.

Add these origins to the client in Google Cloud Console:

- `https://deepgate-production.up.railway.app`
- `http://localhost:3000`

Steps:

1. Open https://console.cloud.google.com/apis/credentials
2. Pick the project the actionbot OAuth client lives in.
3. Click the OAuth 2.0 Client ID matching `425613513915-qbheokls...`.
4. Under **Authorized JavaScript origins**, click **Add URI** twice and paste
   the two URLs above.
5. **Leave "Authorized redirect URIs" alone** — GIS does not use them.
6. Save. Changes propagate within a few minutes.

## What was NOT needed

- **No Supabase Auth dashboard step.** DeepGate doesn't use Supabase Auth — it uses
  its own JWT cookie + Postgres `deepgate.users`. The Google ID token is verified
  server-side via `https://oauth2.googleapis.com/tokeninfo` and a row is inserted
  with the same trial defaults the schema gives email signups (100K tokens, 7-day
  expiry).
- **No `/auth/callback` route.** GIS returns the credential to a JS callback in the
  browser — there is no OAuth redirect leg.

## Env vars

Set on Railway service `deepgate`:

- `GOOGLE_CLIENT_ID=425613513915-qbheokls4nqe7fa48463ok42ef08a93v.apps.googleusercontent.com`

The component falls back to that same value via a hard-coded default, so missing
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is fine. The backend uses `GOOGLE_CLIENT_ID` to
verify the `aud` claim — without it, audience check is skipped (still safe since
Google verifies the signature, but you should set it).

## DB migration

`migrations/0002_google_oauth.sql` — already applied to prod:

- `deepgate.users.password_hash` is now nullable (Google-only users have no password)
- `deepgate.users.google_id text UNIQUE` added with partial index
