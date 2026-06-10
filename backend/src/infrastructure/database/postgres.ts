import { Pool, PoolClient, QueryResult, types } from 'pg';
import { env } from './env';

// Postgres DATE (OID 1082) mặc định bị parse thành JavaScript Date (UTC midnight)
// → gây ra lỗi timezone khi hiển thị. Override để trả về string 'YYYY-MM-DD' thô.
types.setTypeParser(1082, (val: string) => val);

// Postgres INT8 / BIGINT (OID 20) mặc định bị parse thành string.
// Override để tự động parse thành JavaScript number.
types.setTypeParser(20, (val: string) => parseInt(val, 10));

export const pgPool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  user: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,
  max: env.postgres.poolMax,
  idleTimeoutMillis: env.postgres.idleTimeoutMillis,
});

pgPool.on('error', (err: Error) => {
  console.error('[PostgreSQL] Unexpected pool error:', err.message);
});

export async function checkPostgresConnection(): Promise<void> {
  let client: PoolClient | null = null;
  try {
    client = await pgPool.connect();
    const res: QueryResult<{ now: string }> = await client.query('SELECT NOW() as now');
    console.log(`[PostgreSQL] Connected - server time: ${res.rows[0].now}`);
  } catch (err) {
    console.error('[PostgreSQL] Connection failed:', (err as Error).message);
    throw err;
  } finally {
    if (client) client.release();
  }
}

export async function closePostgresPool(): Promise<void> {
  await pgPool.end();
  console.log('[PostgreSQL] Pool closed');
}
