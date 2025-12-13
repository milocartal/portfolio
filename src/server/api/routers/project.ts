import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

// Zod schema for Project
const projectInput = z.object({
  name: z.string().min(1),
  summaryMd: z.string().optional(),
  url: z.string().optional(),
  repoUrl: z.string().optional(),
  orderIndex: z.number().optional(),
});

export const projectRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.project.findMany({
      orderBy: { orderIndex: "asc" },
      include: { Skills: true },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.project.findUnique({
        where: { id: input.id },
        include: { Skills: true },
      });
    }),

  // Create
  create: protectedProcedure
    .input(projectInput)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("project").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create project records.",
        });
      }

      let index: number;
      if (input.orderIndex !== undefined) {
        index = input.orderIndex;
      } else {
        const lastProject = await db.project.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        index = lastProject ? lastProject.orderIndex + 1 : 0;
      }

      return db.project.create({
        data: {
          ...input,
          orderIndex: index,
        },
      });
    }),

  // Update
  update: protectedProcedure
    .input(
      projectInput.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("project").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update project records.",
        });
      }
      const { id, ...data } = input;
      return db.project.update({
        where: { id },
        data,
      });
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("project").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete project records.",
        });
      }
      return db.project.delete({
        where: { id: input.id },
      });
    }),
});
