import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

// Zod schema for Cv
const cvInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  theme: z.string().optional(),
  sectionOrder: z.string(),

  experiencesIds: z.array(z.string()).min(1),
  projectsIds: z.array(z.string()).min(1),
  skillsIds: z.array(z.string()).min(1),
  educationsIds: z.array(z.string()).min(1),
});

export const cvRouter = createTRPCRouter({
  // Read all
  getAll: publicProcedure.query(async () => {
    return db.cvVersion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        Experiences: true,
        Projects: true,
        Skills: true,
        Educations: true,
      },
    });
  }),

  // Read one
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.cvVersion.findUnique({
        where: { id: input.id },
        include: {
          Experiences: true,
          Projects: true,
          Skills: true,
          Educations: true,
        },
      });
    }),

  // Create
  create: protectedProcedure.input(cvInput).mutation(async ({ ctx, input }) => {
    if (!can(ctx.session).createAny("cv").granted) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to create CV records.",
      });
    }

    const cv = await db.cvVersion.create({
      data: {
        ...input,
      },
    });

    if (input.educationsIds.length > 0) {
      await db.cvVersionEducation.createMany({
        data: input.educationsIds.map((educationId) => ({
          cvId: cv.id,
          educationId,
        })),
      });
    }

    if (input.projectsIds.length > 0) {
      await db.cvVersionProject.createMany({
        data: input.projectsIds.map((projectId) => ({
          cvId: cv.id,
          projectId,
        })),
      });
    }

    if (input.skillsIds.length > 0) {
      await db.cvVersionSkill.createMany({
        data: input.skillsIds.map((skillId) => ({
          cvId: cv.id,
          skillId,
        })),
      });
    }

    if (input.educationsIds.length > 0) {
      await db.cvVersionEducation.createMany({
        data: input.educationsIds.map((educationId) => ({
          cvId: cv.id,
          educationId,
        })),
      });
    }

    return cv;
  }),

  // Update
  update: protectedProcedure
    .input(
      cvInput.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("cv").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update CV records.",
        });
      }
      const { id, ...data } = input;
      const cv = db.cvVersion.update({
        where: { id },
        data: {
          ...data,
          Experiences: {
            deleteMany: {
              cvId: id,
            },
            createMany: {
              data: input.experiencesIds.map((experienceId) => ({
                cvId: id,
                experienceId,
              })),
            },
          },
          Projects: {
            deleteMany: {
              cvId: id,
            },
            createMany: {
              data: input.projectsIds.map((projectId) => ({
                cvId: id,
                projectId,
              })),
            },
          },
          Skills: {
            deleteMany: {
              cvId: id,
            },
            createMany: {
              data: input.skillsIds.map((skillId) => ({
                cvId: id,
                skillId,
              })),
            },
          },
          Educations: {
            deleteMany: {
              cvId: id,
            },
            createMany: {
              data: input.educationsIds.map((educationId) => ({
                cvId: id,
                educationId,
              })),
            },
          },
        },
      });

      return cv;
    }),

  // Delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("cv").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete CV records.",
        });
      }
      return db.cvVersion.delete({
        where: { id: input.id },
      });
    }),
});
