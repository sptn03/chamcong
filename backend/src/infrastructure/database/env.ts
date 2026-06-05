import 'dotenv/config';

function num(name: string, def: number): number {
  const val = process.env[name];
  if (val === undefined || val === '') return def;
  const n = Number(val);
  return Number.isNaN(n) ? def : n;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'dev',
  port: num('PORT', 3000),

  postgres: {
    host: process.env.PG_HOST ?? 'localhost',
    port: num('PG_PORT', 5432),
    user: process.env.PG_USER ?? 'postgres',
    password: process.env.PG_PASSWORD ?? 'postgres',
    database: process.env.PG_DATABASE ?? 'hunchamcong',
    poolMax: num('PG_POOL_MAX', 20),
    idleTimeoutMillis: num('PG_IDLE_TIMEOUT_MS', 30000),
  },

  hunonic: {
    verifyUrl: process.env.HUNONIC_VERIFY_URL ?? 'https://hunonic.com/api/verify',
    apiKey: process.env.HUNONIC_API_KEY ?? '',
    timeoutMs: num('HUNONIC_TIMEOUT_MS', 10000),
  },
} as const;
