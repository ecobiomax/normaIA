import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  longtext,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Profiles table - Extended user information specific to NormaIA
 */
export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fullName: text("fullName"),
  certifications: longtext("certifications"), // JSON array of certifications
  company: text("company"),
  role: text("role"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Subscriptions table - Tracks user subscription status and trial
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["trial", "active", "cancelled", "expired", "pending"]).default("trial").notNull(),
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  lastPaymentDate: timestamp("lastPaymentDate"),
  nextDueDate: timestamp("nextDueDate"),
  abacatePayBillingId: varchar("abacatePayBillingId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Chat history table - Stores all user questions and AI responses
 */
export const chatHistory = mysqlTable("chatHistory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  question: longtext("question").notNull(),
  answer: longtext("answer").notNull(),
  sources: longtext("sources"), // JSON array of cited norms with metadata
  tokensUsed: int("tokensUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatHistoryRecord = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

/**
 * Documents table - Tracks uploaded PDF norms
 */
export const documents = mysqlTable("documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
  fileUrl: varchar("fileUrl", { length: 500 }),
  mimeType: varchar("mimeType", { length: 100 }),
  normName: varchar("normName", { length: 255 }),
  normType: varchar("normType", { length: 100 }), // NBR, ASME, Petrobras, etc
  totalPages: int("totalPages"),
  totalChunks: int("totalChunks"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Document chunks table - Stores processed chunks for RAG
 */
export const documentChunks = mysqlTable("documentChunks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  documentId: varchar("documentId", { length: 64 }).notNull().references(() => documents.id),
  chunkIndex: int("chunkIndex").notNull(),
  content: longtext("content").notNull(),
  section: varchar("section", { length: 255 }),
  pageNumber: int("pageNumber"),
  qdrantId: varchar("qdrantId", { length: 255 }), // ID in Qdrant collection
  metadata: longtext("metadata"), // JSON with norm info, section, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = typeof documentChunks.$inferInsert;

/**
 * Audit log table - Track important events for monitoring
 */
export const auditLog = mysqlTable("auditLog", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").references(() => users.id),
  eventType: varchar("eventType", { length: 100 }).notNull(), // signup, login, upload, payment, etc
  eventData: longtext("eventData"), // JSON with event details
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;