-- Admin flag for owner dashboard access.
ALTER TABLE deepgate.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Promote the owner account.
UPDATE deepgate.users SET is_admin = true WHERE email = 'sachhu.ap@gmail.com';
