import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import crypto from "crypto";

export type LocalAuthUser = {
  id: number;
  email: string;
  passwordHash: string;
  openId: string;
  name: string | null;
  createdAt: string;
};

let _dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createPasswordResetToken(params: {
  openId: string;
  expiresInMinutes?: number;
}): Promise<{ token: string; expiresAt: string }> {
  const db = await getLocalAuthDb();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresInMinutes = params.expiresInMinutes ?? 30;
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  await db.run(
    `INSERT INTO password_reset_tokens (open_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?)` ,
    params.openId,
    tokenHash,
    expiresAt,
    new Date().toISOString()
  );

  return { token, expiresAt };
}

export async function consumePasswordResetToken(params: {
  token: string;
}): Promise<{ openId: string } | null> {
  const db = await getLocalAuthDb();
  const tokenHash = crypto.createHash("sha256").update(params.token).digest("hex");
  const row = await db.get<any>(
    `SELECT id, open_id as openId, expires_at as expiresAt, used_at as usedAt
     FROM password_reset_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    tokenHash
  );

  if (!row) return null;
  if (row.usedAt) return null;

  const now = Date.now();
  const expiresAtMs = new Date(row.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || now > expiresAtMs) {
    return null;
  }

  await db.run(
    `UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`,
    new Date().toISOString(),
    row.id
  );

  return { openId: row.openId as string };
}

export async function updateLocalAuthPassword(params: {
  openId: string;
  passwordHash: string;
}): Promise<void> {
  const db = await getLocalAuthDb();
  await db.run(
    `UPDATE auth_users SET password_hash = ? WHERE open_id = ?`,
    params.passwordHash,
    params.openId
  );
}

async function init(db: Database<sqlite3.Database, sqlite3.Statement>) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      open_id TEXT NOT NULL UNIQUE,
      name TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      open_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export async function getLocalAuthDb() {
  if (_dbPromise) return _dbPromise;

  const filePath = path.resolve(process.env.AUTH_SQLITE_PATH ?? "data/auth.sqlite");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  _dbPromise = open({
    filename: filePath,
    driver: sqlite3.Database,
  }).then(async (db: Database<sqlite3.Database, sqlite3.Statement>) => {
    await init(db);
    return db;
  });

  return _dbPromise;
}

export async function getLocalAuthUserByEmail(email: string): Promise<LocalAuthUser | null> {
  const db = await getLocalAuthDb();
  const row = await db.get<any>(
    `SELECT id, email, password_hash as passwordHash, open_id as openId, name, created_at as createdAt
     FROM auth_users
     WHERE email = ?
     LIMIT 1`,
    normalizeEmail(email)
  );
  return row ?? null;
}

export async function getLocalAuthUserByOpenId(openId: string): Promise<LocalAuthUser | null> {
  const db = await getLocalAuthDb();
  const row = await db.get<any>(
    `SELECT id, email, password_hash as passwordHash, open_id as openId, name, created_at as createdAt
     FROM auth_users
     WHERE open_id = ?
     LIMIT 1`,
    openId
  );
  return row ?? null;
}

export async function createLocalAuthUser(params: {
  email: string;
  passwordHash: string;
  openId: string;
  name?: string | null;
}): Promise<void> {
  const db = await getLocalAuthDb();
  await db.run(
    `INSERT INTO auth_users (email, password_hash, open_id, name, created_at)
     VALUES (?, ?, ?, ?, ?)` ,
    normalizeEmail(params.email),
    params.passwordHash,
    params.openId,
    params.name ?? null,
    new Date().toISOString()
  );
}
