import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { educationSchema } from "~/lib/models/Education";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

export const educationRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.education.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.education.findUnique({
        where: { id: input.id },
      });
    }),

  // Create
  create: protectedProcedure
    .input(educationSchema)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create education records.",
        });
      }

      let index: number;
      if (input.orderIndex !== undefined) {
        index = input.orderIndex;
      } else {
        const lastEducation = await db.education.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        index = lastEducation ? lastEducation.orderIndex + 1 : 0;
      }

      return db.education.create({
        data: {
          ...input,
          orderIndex: index,
        },
      });
    }),

  // Update
  update: protectedProcedure
    .input(
      educationSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update education records.",
        });
      }
      const { id, ...data } = input;
      return db.education.update({
        where: { id },
        data,
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete education records.",
        });
      }
      return ctx.db.education.delete({
        where: { id: input.id },
      });
    }),
});
