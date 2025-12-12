import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { educationRouter } from "~/server/api/routers/education";
import { experienceRouter } from "~/server/api/routers/experience";
import { profileRouter } from "~/server/api/routers/profile";
import { projectRouter } from "~/server/api/routers/project";
import { skillRouter } from "~/server/api/routers/skill";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  education: educationRouter,
  experience: experienceRouter,
  profile: profileRouter,
  project: projectRouter,
  skill: skillRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
