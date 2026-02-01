import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  profiles,
  subscriptions,
  chatHistory,
  documents,
  documentChunks,
  auditLog,
  InsertProfile,
  InsertSubscription,
  InsertChatHistory,
  InsertDocument,
  InsertDocumentChunk,
  InsertAuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createProfile(userId: number, data: Partial<InsertProfile>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(profiles).values({
    id: nanoid(),
    userId,
    ...data,
  });
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(userId: number, data?: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const trialStart = new Date();
  const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  await db.insert(subscriptions).values({
    id: nanoid(),
    userId,
    status: "trial",
    trialStart,
    trialEnd,
    ...data,
  });
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(userId: number, data: Partial<InsertSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

export async function saveChatMessage(userId: number, question: string, answer: string, sources?: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(chatHistory).values({
    id: nanoid(),
    userId,
    question,
    answer,
    sources: sources ? JSON.stringify(sources) : null,
  });
}

export async function getChatHistoryByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
  
  return result;
}

export async function createDocument(userId: number, data: Omit<Partial<InsertDocument>, 'id' | 'userId' | 'status'>): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = nanoid();
  await db.insert(documents).values({
    id,
    userId,
    status: "pending",
    fileName: data.fileName || "",
    fileKey: data.fileKey || "",
    ...data,
  } as InsertDocument);
  
  return id;
}

export async function getDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documents).where(eq(documents.userId, userId));
}

export async function updateDocument(documentId: string, data: Partial<InsertDocument>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set(data).where(eq(documents.id, documentId));
}

export async function createDocumentChunk(data: Omit<InsertDocumentChunk, 'id'>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(documentChunks).values({
    id: nanoid(),
    ...data,
  } as InsertDocumentChunk);
}

export async function getChunksByDocumentId(documentId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documentChunks).where(eq(documentChunks.documentId, documentId));
}

export async function logAuditEvent(userId: number | null, eventType: string, eventData?: any, ipAddress?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(auditLog).values({
      id: nanoid(),
      userId: userId || undefined,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : null,
      ipAddress,
    });
  } catch (error) {
    console.warn("[Audit] Failed to log event:", error);
  }
}
