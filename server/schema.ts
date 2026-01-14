import { pgTable, text, serial, integer, timestamp, uuid, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  mmr: integer("mmr").default(1000).notNull(),
  rankTier: varchar("rank_tier", { length: 20 }).default("PLASTIC").notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  winStreak: integer("win_streak").default(0).notNull(),
  lastPlayedAt: timestamp("last_played_at"),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 20 }).default("ranked").notNull(),
  winnerId: uuid("winner_id").references(() => users.id),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matchParticipants = pgTable("match_participants", {
  matchId: uuid("match_id").references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  score: integer("score").default(0).notNull(),
  mmrChange: integer("mmr_change").default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.matchId, table.userId] }),
}));

// Ranked questions pool (pre-generated for fairness)
export const rankedQuestions = pgTable("ranked_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array as string
  correctAnswer: integer("correct_answer").notNull(), // Index 0-3
  explanation: text("explanation"),
  category: varchar("category", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // easy, medium, hard
  timesUsed: integer("times_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
