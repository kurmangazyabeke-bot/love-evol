import { neon } from "@neondatabase/serverless";
import { DbInvitation, DbInvitationStatus, DbUser } from "@/types/db";

let schemaInitialized = false;
let schemaInitPromise: Promise<void> | null = null;

export function getDatabaseUrl(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

export function isVercelPostgresConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("Vercel Postgres DATABASE_URL is not configured");
  }
  return neon(url);
}

export async function ensurePostgresSchema(): Promise<void> {
  if (schemaInitialized) return;
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    const sql = getSql();

    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email))
    `;

    // 2. Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at)
    `;

    // 3. Invitations table
    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        config JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_paid BOOLEAN NOT NULL DEFAULT true,
        status TEXT NOT NULL DEFAULT 'pending',
        views_count INTEGER NOT NULL DEFAULT 0,
        first_opened_at TIMESTAMPTZ,
        last_opened_at TIMESTAMPTZ,
        guest_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE invitations
      ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0
    `;
    await sql`
      ALTER TABLE invitations
      ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMPTZ
    `;
    await sql`
      ALTER TABLE invitations
      ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations (user_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations (status)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations (created_at DESC)
    `;

    // 4. Media assets table
    await sql`
      CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        file_name TEXT,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        base64_data TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    schemaInitialized = true;
  })().catch((err) => {
    schemaInitPromise = null;
    throw err;
  });

  return schemaInitPromise;
}

function rowToInvitation(row: Record<string, unknown>): DbInvitation {
  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    config:
      typeof row.config === "string"
        ? JSON.parse(row.config)
        : ((row.config as Record<string, unknown>) || {}),
    is_paid: row.is_paid !== false,
    status: (row.status as DbInvitationStatus) || "pending",
    views_count: Number(row.views_count || 0),
    first_opened_at: row.first_opened_at
      ? new Date(String(row.first_opened_at)).toISOString()
      : null,
    last_opened_at: row.last_opened_at
      ? new Date(String(row.last_opened_at)).toISOString()
      : null,
    guest_answers:
      typeof row.guest_answers === "string"
        ? JSON.parse(row.guest_answers)
        : ((row.guest_answers as Record<string, unknown>) || {}),
    created_at: row.created_at
      ? new Date(String(row.created_at)).toISOString()
      : new Date().toISOString(),
    updated_at: row.updated_at
      ? new Date(String(row.updated_at)).toISOString()
      : new Date().toISOString(),
  };
}

function rowToUser(row: Record<string, unknown>): DbUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
    created_at: row.created_at
      ? new Date(String(row.created_at)).toISOString()
      : new Date().toISOString(),
    updated_at: row.updated_at
      ? new Date(String(row.updated_at)).toISOString()
      : undefined,
  };
}

// ============================================================================
// AUTH & USERS
// ============================================================================

export async function pgCreateUser(data: {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  avatarUrl?: string;
}): Promise<DbUser> {
  await ensurePostgresSchema();
  const sql = getSql();
  const normalizedEmail = data.email.trim().toLowerCase();

  const rows = await sql`
    INSERT INTO users (id, email, password_hash, name, avatar_url, created_at, updated_at)
    VALUES (
      ${data.id},
      ${normalizedEmail},
      ${data.passwordHash},
      ${data.name || null},
      ${data.avatarUrl || null},
      NOW(),
      NOW()
    )
    RETURNING id, email, name, avatar_url, created_at, updated_at
  `;

  return rowToUser(rows[0] as Record<string, unknown>);
}

export async function pgGetUserByEmail(email: string): Promise<{
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
} | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const normalized = email.trim().toLowerCase();

  const rows = await sql`
    SELECT id, email, password_hash, name, avatar_url, created_at
    FROM users
    WHERE LOWER(email) = ${normalized}
    LIMIT 1
  `;

  if (!rows || rows.length === 0) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    id: String(r.id),
    email: String(r.email),
    password_hash: String(r.password_hash),
    name: r.name ? String(r.name) : null,
    avatar_url: r.avatar_url ? String(r.avatar_url) : null,
    created_at: new Date(String(r.created_at)).toISOString(),
  };
}

export async function pgGetUserById(id: string): Promise<DbUser | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, name, avatar_url, created_at, updated_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows || rows.length === 0) return null;
  return rowToUser(rows[0] as Record<string, unknown>);
}

export async function pgCreateSession(
  token: string,
  userId: string,
  expiresAt: Date
): Promise<void> {
  await ensurePostgresSchema();
  const sql = getSql();
  await sql`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()}::timestamptz, NOW())
  `;
}

export async function pgGetSessionWithUser(
  token: string
): Promise<{ user: DbUser; expiresAt: Date } | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.token,
      s.expires_at,
      u.id AS user_id,
      u.email,
      u.name,
      u.avatar_url,
      u.created_at AS user_created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.expires_at > NOW()
    LIMIT 1
  `;

  if (!rows || rows.length === 0) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    user: {
      id: String(r.user_id),
      email: String(r.email),
      name: r.name ? String(r.name) : null,
      avatar_url: r.avatar_url ? String(r.avatar_url) : null,
      created_at: new Date(String(r.user_created_at)).toISOString(),
    },
    expiresAt: new Date(String(r.expires_at)),
  };
}

export async function pgDeleteSession(token: string): Promise<void> {
  await ensurePostgresSchema();
  const sql = getSql();
  await sql`
    DELETE FROM sessions WHERE token = ${token}
  `;
}

export async function pgClaimGuestInvitations(
  userId: string,
  invitationIds: string[]
): Promise<number> {
  if (!invitationIds || invitationIds.length === 0) return 0;
  await ensurePostgresSchema();
  const sql = getSql();

  const res = await sql`
    UPDATE invitations
    SET user_id = ${userId}, updated_at = NOW()
    WHERE id = ANY(${invitationIds})
      AND (user_id IS NULL OR user_id = '')
  `;
  return res.length || 0;
}

// ============================================================================
// INVITATIONS CRUD
// ============================================================================

export async function pgUpsertInvitation(data: {
  id: string;
  user_id?: string | null;
  config: Record<string, unknown>;
  is_paid?: boolean;
}): Promise<DbInvitation> {
  await ensurePostgresSchema();
  const sql = getSql();
  const configJson = JSON.stringify(data.config || {});
  const userId = data.user_id || null;

  const rows = await sql`
    INSERT INTO invitations (id, user_id, config, is_paid, status, updated_at)
    VALUES (${data.id}, ${userId}, ${configJson}::jsonb, true, 'pending', NOW())
    ON CONFLICT (id) DO UPDATE SET
      user_id = COALESCE(EXCLUDED.user_id, invitations.user_id),
      config = EXCLUDED.config,
      is_paid = true,
      updated_at = NOW()
    RETURNING *
  `;

  return rowToInvitation(rows[0] as Record<string, unknown>);
}

export async function pgGetInvitationById(id: string): Promise<DbInvitation | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM invitations WHERE id = ${id} LIMIT 1
  `;
  if (!rows || rows.length === 0) return null;
  return rowToInvitation(rows[0] as Record<string, unknown>);
}

export async function pgRecordInvitationView(id: string): Promise<DbInvitation | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    UPDATE invitations
    SET
      views_count = COALESCE(views_count, 0) + 1,
      first_opened_at = COALESCE(first_opened_at, NOW()),
      last_opened_at = NOW(),
      status = CASE
        WHEN status = 'accepted' THEN 'accepted'
        ELSE 'opened'
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows || rows.length === 0) return null;
  return rowToInvitation(rows[0] as Record<string, unknown>);
}

export async function pgUpdateGuestAnswers(
  id: string,
  answers: Record<string, unknown>,
  nextStatus: DbInvitationStatus = "accepted"
): Promise<DbInvitation | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const answersJson = JSON.stringify(answers || {});

  const rows = await sql`
    UPDATE invitations
    SET
      guest_answers = COALESCE(guest_answers, '{}'::jsonb) || ${answersJson}::jsonb,
      status = ${nextStatus},
      views_count = GREATEST(COALESCE(views_count, 0), 1),
      last_opened_at = COALESCE(last_opened_at, NOW()),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows || rows.length === 0) return null;
  return rowToInvitation(rows[0] as Record<string, unknown>);
}

export async function pgListInvitations(filter?: {
  userId?: string | null;
  ids?: string[];
}): Promise<DbInvitation[]> {
  await ensurePostgresSchema();
  const sql = getSql();

  if (filter?.userId && filter?.ids && filter.ids.length > 0) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE user_id = ${filter.userId} OR id = ANY(${filter.ids})
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  if (filter?.userId) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE user_id = ${filter.userId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  if (filter?.ids && filter.ids.length > 0) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE id = ANY(${filter.ids})
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  const rows = await sql`
    SELECT * FROM invitations
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
}

export async function pgDeleteInvitation(id: string): Promise<boolean> {
  await ensurePostgresSchema();
  const sql = getSql();
  await sql`
    DELETE FROM invitations WHERE id = ${id}
  `;
  return true;
}

// ============================================================================
// MEDIA ASSETS
// ============================================================================

export async function pgSaveMediaAsset(params: {
  id: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  base64Data: string;
}): Promise<string> {
  await ensurePostgresSchema();
  const sql = getSql();
  await sql`
    INSERT INTO media_assets (id, mime_type, file_name, size_bytes, base64_data)
    VALUES (${params.id}, ${params.mimeType}, ${params.fileName}, ${params.sizeBytes}, ${params.base64Data})
    ON CONFLICT (id) DO UPDATE SET
      mime_type = EXCLUDED.mime_type,
      base64_data = EXCLUDED.base64_data,
      size_bytes = EXCLUDED.size_bytes
  `;
  return params.id;
}

export async function pgGetMediaAsset(id: string): Promise<{
  id: string;
  mimeType: string;
  fileName: string | null;
  sizeBytes: number;
  base64Data: string;
} | null> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, mime_type, file_name, size_bytes, base64_data
    FROM media_assets
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows || rows.length === 0) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    id: String(r.id),
    mimeType: String(r.mime_type),
    fileName: r.file_name ? String(r.file_name) : null,
    sizeBytes: Number(r.size_bytes || 0),
    base64Data: String(r.base64_data),
  };
}

export async function pgCheckHealth(): Promise<{
  connected: boolean;
  provider: string;
  invitationsCount?: number;
  mediaCount?: number;
  usersCount?: number;
  latencyMs?: number;
  error?: string;
}> {
  if (!isVercelPostgresConfigured()) {
    return {
      connected: false,
      provider: "fallback",
      error: "DATABASE_URL is not configured",
    };
  }

  const start = Date.now();
  try {
    await ensurePostgresSchema();
    const sql = getSql();
    const invCountRows = await sql`SELECT COUNT(*)::int AS cnt FROM invitations`;
    const mediaCountRows = await sql`SELECT COUNT(*)::int AS cnt FROM media_assets`;
    const usersCountRows = await sql`SELECT COUNT(*)::int AS cnt FROM users`;
    return {
      connected: true,
      provider: "vercel-postgres-neon",
      invitationsCount: Number((invCountRows[0] as Record<string, unknown>)?.cnt || 0),
      mediaCount: Number((mediaCountRows[0] as Record<string, unknown>)?.cnt || 0),
      usersCount: Number((usersCountRows[0] as Record<string, unknown>)?.cnt || 0),
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      connected: false,
      provider: "vercel-postgres-neon",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Database health check failed",
    };
  }
}
