import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

// Zod schema for Experience
const experienceInput = z.object({
  company: z.string().min(1),
  companyUrl: z.string().url().optional(),
  role: z.string().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  summaryMd: z.string().optional(),
  orderIndex: z.number().optional(),
});

export const experienceRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.experience.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        CVs: true,
        Skills: true,
      },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.experience.findUnique({
        where: { id: input.id },
        include: {
          CVs: true,
          Skills: true,
        },
      });
    }),

  // Create
  create: protectedProcedure
    .input(experienceInput)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("experience").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create experience records.",
        });
      }

      let index: number;
      if (input.orderIndex !== undefined) {
        index = input.orderIndex;
      } else {
        const lastExperience = await db.experience.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        index = lastExperience ? lastExperience.orderIndex + 1 : 0;
      }

      return db.experience.create({
        data: {
          ...input,
          orderIndex: index,
        },
      });
    }),

  // Update
  update: protectedProcedure
    .input(
      experienceInput.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("experience").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update experience records.",
        });
      }
      const { id, ...data } = input;
      return db.experience.update({
        where: { id },
        data,
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("experience").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete experience records.",
        });
      }
      return ctx.db.experience.delete({
        where: { id: input.id },
      });
    }),
});
