-- Google OAuth support: allow Google-only users (no password) and link by google_id.
ALTER TABLE deepgate.users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE deepgate.users ADD COLUMN IF NOT EXISTS google_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_dg_users_google_id ON deepgate.users(google_id) WHERE google_id IS NOT NULL;
