import pg from 'pg';

const {
  PGHOST = '127.0.0.1',
  PGPORT = '5432',
  PGUSER = 'user',
  PGPASSWORD = 'password',
  PGDATABASE = 'mydb',
  CACHE_TTL_SECONDS = '3600',
} = process.env;

const pool = new pg.Pool({
  host: PGHOST,
  port: Number(PGPORT),
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  max: 5,
  idleTimeoutMillis: 30000,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS stored_cookies (
        id SMALLINT PRIMARY KEY DEFAULT 1,
        cookies JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } finally {
    client.release();
  }
}

function ttlSeconds() {
  const n = Number(CACHE_TTL_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 3600;
}

export async function getCachedResponse(method, url, authKey) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT status, content, headers
       FROM proxy_cache
       WHERE method = $1 AND url = $2 AND COALESCE(auth_key,'') = COALESCE($3,'')
         AND now() < expire_at
       ORDER BY created_at DESC
       LIMIT 1`,
      [method, url, authKey || null]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    client.release();
  }
}

export async function setCachedResponse(method, url, authKey, status, content, headersObj) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO proxy_cache (method, url, auth_key, status, content, headers, expire_at)
       VALUES ($1, $2, $3, $4, $5, $6, now() + ($7 || ' seconds')::interval)`,
      [method, url, authKey || null, status, content, headersObj ? JSON.stringify(headersObj) : null, String(ttlSeconds())]
    );
  } finally {
    client.release();
  }
}

export async function closeDb() {
  await pool.end();
}

// ===== Cookie persistence helpers =====
export async function getStoredCookies() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SELECT cookies FROM stored_cookies WHERE id = 1`);
    if (rows.length === 0) return null;
    return rows[0].cookies;
  } finally {
    client.release();
  }
}

export async function saveStoredCookies(cookieArray) {
  if (!Array.isArray(cookieArray) || cookieArray.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO stored_cookies (id, cookies, updated_at)
      VALUES (1, $1, now())
      ON CONFLICT (id) DO UPDATE SET cookies = EXCLUDED.cookies, updated_at = now()
    `, [JSON.stringify(cookieArray)]);
  } finally {
    client.release();
  }
}
