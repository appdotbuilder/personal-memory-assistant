import { z } from 'zod';

// Memory type enum
export const memoryTypeEnum = z.enum(['episodic', 'semantic', 'emotional', 'procedural', 'value-principle']);
export type MemoryType = z.infer<typeof memoryTypeEnum>;

// Memory schema
export const memorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  embedding: z.array(z.number()).length(1536), // Vector embedding as number array
  memory_type: memoryTypeEnum,
  summary: z.string(),
  full_text: z.string(),
  details: z.record(z.any()).nullable(), // JSONB field for flexible metadata
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Memory = z.infer<typeof memorySchema>;

// Input schema for creating memories
export const createMemoryInputSchema = z.object({
  user_id: z.string().uuid(),
  embedding: z.array(z.number()).length(1536),
  memory_type: memoryTypeEnum,
  summary: z.string().min(1, 'Summary cannot be empty'),
  full_text: z.string().min(1, 'Full text cannot be empty'),
  details: z.record(z.any()).nullable().optional(), // Optional for creation
});

export type CreateMemoryInput = z.infer<typeof createMemoryInputSchema>;

// Input schema for updating memories
export const updateMemoryInputSchema = z.object({
  id: z.string().uuid(),
  embedding: z.array(z.number()).length(1536).optional(),
  memory_type: memoryTypeEnum.optional(),
  summary: z.string().min(1).optional(),
  full_text: z.string().min(1).optional(),
  details: z.record(z.any()).nullable().optional(),
});

export type UpdateMemoryInput = z.infer<typeof updateMemoryInputSchema>;

// Query schema for memory search with filters
export const queryMemoriesInputSchema = z.object({
  user_id: z.string().uuid(),
  memory_type: memoryTypeEnum.optional(),
  embedding: z.array(z.number()).length(1536).optional(), // For semantic search
  limit: z.number().int().positive().optional().default(20),
  offset: z.number().int().nonnegative().optional().default(0),
  details_filter: z.record(z.any()).optional(), // Filter by details fields
});

export type QueryMemoriesInput = z.infer<typeof queryMemoriesInputSchema>;

// Schema for marking memories as stale
export const markStaleInputSchema = z.object({
  id: z.string().uuid(),
  stale: z.boolean().default(true),
});

export type MarkStaleInput = z.infer<typeof markStaleInputSchema>;

// Delete memory input schema
export const deleteMemoryInputSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteMemoryInput = z.infer<typeof deleteMemoryInputSchema>;