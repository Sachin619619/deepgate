import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __dgPool: Pool | undefined;
}

export const pool: Pool =
  global.__dgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') global.__dgPool = pool;

export async function q<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const r = await pool.query(text, params as never);
  return r.rows as T[];
}
