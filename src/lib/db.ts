import { neon } from "@neondatabase/serverless";
import { DbInvitation, DbInvitationStatus } from "@/types/db";

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

function getSql() {
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
    status: ((row.status as DbInvitationStatus) || "pending"),
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
      status = CASE WHEN status = 'pending' THEN 'opened' ELSE status END
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
  const patchJson = JSON.stringify(answers || {});

  const rows = await sql`
    UPDATE invitations
    SET
      status = ${nextStatus},
      guest_answers = COALESCE(guest_answers, '{}'::jsonb) || ${patchJson}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (!rows || rows.length === 0) return null;
  return rowToInvitation(rows[0] as Record<string, unknown>);
}

export async function pgListInvitations(options?: {
  userId?: string | null;
  ids?: string[];
}): Promise<DbInvitation[]> {
  await ensurePostgresSchema();
  const sql = getSql();

  const userId = options?.userId?.trim() || null;
  const ids = (options?.ids || []).filter(Boolean);

  if (userId && ids.length > 0) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE user_id = ${userId} OR id = ANY(${ids})
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  if (userId) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  if (ids.length > 0) {
    const rows = await sql`
      SELECT * FROM invitations
      WHERE id = ANY(${ids})
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
  }

  const rows = await sql`
    SELECT * FROM invitations
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows.map((r) => rowToInvitation(r as Record<string, unknown>));
}

export async function pgDeleteInvitation(id: string): Promise<boolean> {
  await ensurePostgresSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM invitations WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

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
    return {
      connected: true,
      provider: "vercel-postgres-neon",
      invitationsCount: Number((invCountRows[0] as Record<string, unknown>)?.cnt || 0),
      mediaCount: Number((mediaCountRows[0] as Record<string, unknown>)?.cnt || 0),
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
