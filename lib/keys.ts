import crypto from 'crypto';

const PREFIX = 'dgk_live_';

export function generateApiKey(): { full: string; prefix: string; hash: string } {
  const random = crypto.randomBytes(24).toString('hex'); // 48 chars
  const full = PREFIX + random;
  const prefix = full.slice(0, 14); // dgk_live_ + 5
  const hash = crypto.createHash('sha256').update(full).digest('hex');
  return { full, prefix, hash };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
