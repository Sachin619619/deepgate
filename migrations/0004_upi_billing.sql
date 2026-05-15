-- Manual UPI billing (ActionBot-style): user pays to a UPI VPA and submits
-- the transaction reference; the payment stays pending until an admin verifies it.
ALTER TABLE deepgate.payments ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'upi';
ALTER TABLE deepgate.payments ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE deepgate.payments ADD COLUMN IF NOT EXISTS verified_at timestamptz;
