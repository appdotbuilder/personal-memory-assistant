import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createOrUpdateMemoryInputSchema,
  searchMemoriesInputSchema,
  deleteMemoryInputSchema,
  flagMemoryAsStaleInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { createOrUpdateMemory } from './handlers/create_or_update_memory';
import { searchMemories } from './handlers/search_memories';
import { deleteMemory } from './handlers/delete_memory';
import { flagMemoryAsStale } from './handlers/flag_memory_as_stale';
import { getUserMemories } from './handlers/get_user_memories';

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

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  // Memory curation (write operations)
  createOrUpdateMemory: publicProcedure
    .input(createOrUpdateMemoryInputSchema)
    .mutation(({ input }) => createOrUpdateMemory(input)),

  // Memory retrieval (read operations)
  searchMemories: publicProcedure
    .input(searchMemoriesInputSchema)
    .query(({ input }) => searchMemories(input)),

  getUserMemories: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(({ input }) => getUserMemories(input.userId)),

  // Memory management operations
  deleteMemory: publicProcedure
    .input(deleteMemoryInputSchema)
    .mutation(({ input }) => deleteMemory(input)),

  flagMemoryAsStale: publicProcedure
    .input(flagMemoryAsStaleInputSchema)
    .mutation(({ input }) => flagMemoryAsStale(input)),
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
  console.log(`TRPC server listening at port: ${port}`);
}

start();