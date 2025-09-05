import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Memory types enum
export const memoryTypeEnum = pgEnum('memory_type', [
  'episodic',
  'semantic', 
  'emotional',
  'procedural',
  'value-principle'
]);

// Users table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Memories table with vector embedding support
export const memoriesTable = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  embedding: text('embedding').notNull(), // Vector embedding stored as text (vector(1536) type handled by pgvector)
  memoryType: memoryTypeEnum('memory_type').notNull(),
  summary: text('summary').notNull(),
  fullText: text('full_text').notNull(),
  details: jsonb('details'), // JSONB field for flexible metadata
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  memories: many(memoriesTable)
}));

export const memoriesRelations = relations(memoriesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [memoriesTable.userId],
    references: [usersTable.id]
  })
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Memory = typeof memoriesTable.$inferSelect;
export type NewMemory = typeof memoriesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  users: usersTable, 
  memories: memoriesTable 
};