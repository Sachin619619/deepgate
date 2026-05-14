CREATE SCHEMA IF NOT EXISTS deepgate;

CREATE TABLE IF NOT EXISTS deepgate.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  password_hash text NOT NULL,
  plan text NOT NULL DEFAULT 'trial',
  plan_expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  trial_tokens_remaining bigint NOT NULL DEFAULT 100000,
  paid_pro_tokens_remaining bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deepgate.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES deepgate.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_dg_keys_user ON deepgate.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_dg_keys_hash ON deepgate.api_keys(key_hash) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS deepgate.usage_logs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES deepgate.users(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES deepgate.api_keys(id) ON DELETE SET NULL,
  model text NOT NULL,
  prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  cost_inr numeric(12,6) NOT NULL DEFAULT 0,
  latency_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dg_usage_user_time ON deepgate.usage_logs(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deepgate.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES deepgate.users(id) ON DELETE CASCADE,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_inr numeric(12,2) NOT NULL,
  status text NOT NULL,
  plan_or_topup text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deepgate.rate_limits (
  user_id uuid NOT NULL REFERENCES deepgate.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, model)
);
