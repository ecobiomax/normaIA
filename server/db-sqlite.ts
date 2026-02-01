import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let db: Database.Database;

function initDb() {
  const filePath = path.resolve(process.env.DATABASE_SQLITE_PATH ?? "data/app.sqlite");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  db = new Database(filePath);
  db.pragma("journal_mode = WAL");

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      role TEXT DEFAULT 'user',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      lastSignedIn TEXT
    );
  `);

  // Subscriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      status TEXT DEFAULT 'trial',
      trialStart TEXT,
      trialEnd TEXT,
      nextDueDate TEXT,
      lastPaymentDate TEXT,
      amount INTEGER,
      abacatePayBillingId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}

initDb();

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string | null;
};

export type Subscription = {
  id: number;
  userId: number;
  status: "trial" | "active" | "expired" | "cancelled" | "pending";
  trialStart: string | null;
  trialEnd: string | null;
  nextDueDate: string | null;
  lastPaymentDate: string | null;
  amount: number | null;
  abacatePayBillingId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: string | null;
}) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO users (openId, name, email, loginMethod, lastSignedIn, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(openId) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      loginMethod = excluded.loginMethod,
      lastSignedIn = excluded.lastSignedIn,
      updatedAt = excluded.updatedAt
  `);
  stmt.run(user.openId, user.name ?? null, user.email ?? null, user.loginMethod ?? null, user.lastSignedIn ?? null, now, now);
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE openId = ? LIMIT 1");
  const row = stmt.get(openId) as any;
  return row || null;
}

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const stmt = db.prepare("SELECT * FROM subscriptions WHERE userId = ? LIMIT 1");
  const row = stmt.get(userId) as any;
  return row || null;
}

export async function createSubscription(userId: number) {
  const now = new Date();
  const trialStart = now.toISOString();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const stmt = db.prepare(`
    INSERT INTO subscriptions (userId, status, trialStart, trialEnd, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(userId, "trial", trialStart, trialEnd, trialStart, trialStart);
}

export async function updateSubscription(
  userId: number,
  update: Partial<Subscription>
) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(update)) {
    if (v !== undefined) {
      fields.push(`${k} = ?`);
      values.push(v);
      idx++;
    }
  }
  if (fields.length === 0) return;
  fields.push("updatedAt = ?");
  values.push(new Date().toISOString(), userId);
  const stmt = db.prepare(`UPDATE subscriptions SET ${fields.join(", ")} WHERE userId = ?`);
  stmt.run(...values);
}

export async function saveChatMessage(userId: number, question: string, answer: string) {
  // TODO: Implement chat history storage
}

export async function getChatHistoryByUserId(userId: number, limit: number) {
  // TODO: Implement chat history retrieval
  return [];
}
