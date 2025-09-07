import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { skillSchema } from "~/lib/models/Skill";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

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
    .input(skillSchema)
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
      skillSchema.extend({
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
