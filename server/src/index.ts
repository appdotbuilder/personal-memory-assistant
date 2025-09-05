import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createMemoryInputSchema,
  updateMemoryInputSchema,
  queryMemoriesInputSchema,
  markStaleInputSchema,
  deleteMemoryInputSchema
} from './schema';

// Import handlers
import { createMemory } from './handlers/create_memory';
import { getMemories } from './handlers/get_memories';
import { getMemoryById } from './handlers/get_memory_by_id';
import { updateMemory } from './handlers/update_memory';
import { deleteMemory } from './handlers/delete_memory';
import { markMemoryStale } from './handlers/mark_memory_stale';
import { searchMemoriesBySimilarity } from './handlers/search_memories_by_similarity';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new memory
  createMemory: publicProcedure
    .input(createMemoryInputSchema)
    .mutation(({ input }) => createMemory(input)),

  // Get memories with advanced filtering and search
  getMemories: publicProcedure
    .input(queryMemoriesInputSchema)
    .query(({ input }) => getMemories(input)),

  // Get a single memory by ID
  getMemoryById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => getMemoryById(input.id)),

  // Update an existing memory
  updateMemory: publicProcedure
    .input(updateMemoryInputSchema)
    .mutation(({ input }) => updateMemory(input)),

  // Delete a memory permanently
  deleteMemory: publicProcedure
    .input(deleteMemoryInputSchema)
    .mutation(({ input }) => deleteMemory(input)),

  // Mark a memory as stale (soft delete)
  markMemoryStale: publicProcedure
    .input(markStaleInputSchema)
    .mutation(({ input }) => markMemoryStale(input)),

  // Semantic similarity search
  searchMemoriesBySimilarity: publicProcedure
    .input(z.object({
      user_id: z.string().uuid(),
      embedding: z.array(z.number()).length(1536),
      memory_type: z.enum(['episodic', 'semantic', 'emotional', 'procedural', 'value-principle']).optional(),
      limit: z.number().int().positive().optional().default(10),
      similarity_threshold: z.number().min(0).max(1).optional().default(0.7)
    }))
    .query(({ input }) => searchMemoriesBySimilarity(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Personal Assistant Memory System TRPC server listening at port: ${port}`);
  console.log('Available endpoints:');
  console.log('  - POST /createMemory - Create a new memory');
  console.log('  - GET /getMemories - Query memories with filters');
  console.log('  - GET /getMemoryById - Get a single memory by ID');
  console.log('  - POST /updateMemory - Update an existing memory');
  console.log('  - POST /deleteMemory - Delete a memory permanently');
  console.log('  - POST /markMemoryStale - Mark a memory as stale');
  console.log('  - GET /searchMemoriesBySimilarity - Semantic similarity search');
}

start();