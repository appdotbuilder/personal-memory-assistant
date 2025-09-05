import { z } from 'zod';

// Memory types enum schema
export const memoryTypeSchema = z.enum([
  'episodic',
  'semantic',
  'emotional',
  'procedural',
  'value-principle'
]);
export type MemoryType = z.infer<typeof memoryTypeSchema>;

// Confidence score enum schema
export const confidenceScoreSchema = z.enum(['high', 'medium', 'low']);
export type ConfidenceScore = z.infer<typeof confidenceScoreSchema>;

// Revision history entry schema
export const revisionHistoryEntrySchema = z.object({
  timestamp: z.string(),
  oldSummary: z.string(),
  newSummary: z.string()
});
export type RevisionHistoryEntry = z.infer<typeof revisionHistoryEntrySchema>;

// Details JSONB schema for memory metadata
export const memoryDetailsSchema = z.object({
  keywords: z.array(z.string()).optional(),
  dates: z.array(z.string()).optional(),
  confidenceScore: confidenceScoreSchema.optional(),
  emotionTags: z.array(z.string()).optional(),
  revisionHistory: z.array(revisionHistoryEntrySchema).optional(),
  sourceHash: z.string().optional(),
  isStale: z.boolean().optional()
}).optional();
export type MemoryDetails = z.infer<typeof memoryDetailsSchema>;

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.coerce.date()
});
export type User = z.infer<typeof userSchema>;

// Memory schema
export const memorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  embedding: z.string(), // Vector embedding as string
  memoryType: memoryTypeSchema,
  summary: z.string(),
  fullText: z.string(),
  details: memoryDetailsSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Memory = z.infer<typeof memorySchema>;

// Input schema for creating users
export const createUserInputSchema = z.object({
  name: z.string().min(1, 'Name is required')
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Input schema for creating/updating memories
export const createOrUpdateMemoryInputSchema = z.object({
  userId: z.string().uuid(),
  embedding: z.string(),
  memoryType: memoryTypeSchema,
  summary: z.string().min(1, 'Summary is required'),
  fullText: z.string().min(1, 'Full text is required'),
  details: memoryDetailsSchema
});
export type CreateOrUpdateMemoryInput = z.infer<typeof createOrUpdateMemoryInputSchema>;

// Search options schema for memory retrieval
export const searchOptionsSchema = z.object({
  memoryType: memoryTypeSchema.optional(),
  emotionTags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(10)
}).optional();
export type SearchOptions = z.infer<typeof searchOptionsSchema>;

// Search memories input schema
export const searchMemoriesInputSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  options: searchOptionsSchema
});
export type SearchMemoriesInput = z.infer<typeof searchMemoriesInputSchema>;

// Delete memory input schema
export const deleteMemoryInputSchema = z.object({
  memoryId: z.string().uuid()
});
export type DeleteMemoryInput = z.infer<typeof deleteMemoryInputSchema>;

// Flag memory as stale input schema
export const flagMemoryAsStaleInputSchema = z.object({
  memoryId: z.string().uuid()
});
export type FlagMemoryAsStaleInput = z.infer<typeof flagMemoryAsStaleInputSchema>;