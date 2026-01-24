import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { linkSchema } from "~/lib/models/Link";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

export const linkRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.link.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.link.findUnique({
        where: { id: input.id },
      });
    }),

  // Create
  create: protectedProcedure
    .input(linkSchema)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("link").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create link records.",
        });
      }

      let index: number;
      if (input.orderIndex !== undefined) {
        index = input.orderIndex;
      } else {
        const lastLink = await db.link.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        index = lastLink ? lastLink.orderIndex + 1 : 0;
      }

      return db.link.create({
        data: {
          ...input,
          orderIndex: index,
        },
      });
    }),

  // Update
  update: protectedProcedure
    .input(linkSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("link").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update link records.",
        });
      }
      const { id, ...data } = input;
      return db.link.update({
        where: { id },
        data,
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("link").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete link records.",
        });
      }
      return ctx.db.link.delete({
        where: { id: input.id },
      });
    }),
});
