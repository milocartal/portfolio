import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

// Zod schema for Profile
const profileInput = z.object({
  fullName: z.string().min(1),
  headline: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  aboutMd: z.string().optional(),
});

export const profileRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  get: publicProcedure.query(async () => {
    return db.profile.findUnique({
      where: { id: "profile" },
    });
  }),

  // Upsert
  upsert: protectedProcedure
    .input(profileInput)
    .mutation(async ({ ctx, input }) => {
      if (
        !can(ctx.session).updateAny("profile").granted ||
        !can(ctx.session).createAny("profile").granted
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update profile.",
        });
      }
      return db.profile.upsert({
        where: { id: "profile" },
        create: input,
        update: input,
      });
    }),
});
