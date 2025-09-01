import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

// Zod schema for Skill
const skillInput = z.object({
  name: z.string().min(1),
  level: z.string().optional(),
  orderIndex: z.number().optional(),
});

export const skillRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.skill.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.skill.findUnique({
        where: { id: input.id },
      });
    }),

  // Create
  create: protectedProcedure
    .input(skillInput)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("skill").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create skill records.",
        });
      }

      return db.skill.create({
        data: {
          ...input,
        },
      });
    }),

  // Update
  update: protectedProcedure
    .input(
      skillInput.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("skill").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update skill records.",
        });
      }
      const { id, ...data } = input;
      return db.skill.update({
        where: { id },
        data,
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("skill").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete skill records.",
        });
      }
      return db.skill.delete({
        where: { id: input.id },
      });
    }),
});
