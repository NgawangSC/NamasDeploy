const { Pool } = require('pg')

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const hasDiscreteConfig = Boolean(process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE)

const isDbEnabled = hasDatabaseUrl || hasDiscreteConfig

let pool = null

if (isDbEnabled) {
  const poolConfig = hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: parseInt(process.env.PGPORT || '5432', 10),
        ssl: process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      }

  pool = new Pool(poolConfig)
}

async function initDb() {
  if (!isDbEnabled) {
    console.warn('[DB] Skipping DB init: no Postgres configuration found')
    return
  }

  const ddl = `
  CREATE TABLE IF NOT EXISTS projects (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    location TEXT,
    year TEXT,
    client TEXT,
    design_team TEXT,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT,
    image TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT,
    excerpt TEXT,
    category TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS clients (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    contact TEXT,
    logo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    position TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured);
  `

  await pool.query(ddl)
  console.log('[DB] Initialized tables')
}

async function query(text, params) {
  if (!isDbEnabled) throw new Error('DB disabled: missing configuration')
  return pool.query(text, params)
}

module.exports = {
  isDbEnabled,
  pool,
  initDb,
  query,
}