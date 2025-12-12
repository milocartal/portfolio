import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, { message: "Le nom doit faire au moins 1 caractère" }),
  summaryMd: z.string().optional(),
  url: z.string().url({ message: "L'URL doit être valide" }).optional(),
  repoUrl: z.string().url({ message: "L'URL doit être valide" }).optional(),
  orderIndex: z.number().optional(),
});

export type ProjectWithSkills = Prisma.ProjectGetPayload<{
  include: { Skills: true };
}>;
