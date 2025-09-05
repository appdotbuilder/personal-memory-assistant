import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Memory type enum for database
export const memoryTypeEnum = pgEnum('memory_type', ['episodic', 'semantic', 'emotional', 'procedural', 'value-principle']);

// Memories table with pgvector support
export const memoriesTable = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  // Vector embedding - using text type with pgvector cast for compatibility
  embedding: text('embedding').notNull(), // Will store as vector(1536) in DB with custom SQL
  memory_type: memoryTypeEnum('memory_type').notNull(),
  summary: text('summary').notNull(),
  full_text: text('full_text').notNull(),
  details: jsonb('details'), // Nullable JSONB field for flexible metadata
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Memory = typeof memoriesTable.$inferSelect;
export type NewMemory = typeof memoriesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { memories: memoriesTable };

// SQL for creating the vector extension and modifying the embedding column
// This should be run manually or through a migration
export const createVectorExtensionSQL = sql`CREATE EXTENSION IF NOT EXISTS vector`;
export const alterEmbeddingColumnSQL = sql`ALTER TABLE memories ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536)`;

// Index for semantic similarity search
export const createEmbeddingIndexSQL = sql`CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`;