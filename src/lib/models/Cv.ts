import z from "zod";
import type { CvVersion } from "@prisma/client";

export const cvSchema = z.object({
  title: z
    .string({ required_error: "Le titre est requis" })
    .min(1, { message: "Le titre doit faire au moins 1 caractère" })
    .max(100, { message: "Le titre doit faire au plus 100 caractères" }),

  slug: z
    .string({ required_error: "Le slug est requis" })
    .min(1, { message: "Le slug doit faire au moins 1 caractère" })
    .max(100, { message: "Le slug doit faire au plus 100 caractères" })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    }),

  theme: z.string().optional().default("modern"),

  sectionOrder: z
    .string({ required_error: "L'ordre des sections est requis" })
    .min(1, { message: "L'ordre des sections est requis" }),

  experiencesIds: z
    .array(z.string())
    .min(1, { message: "Au moins une expérience est requise" }),

  projectsIds: z
    .array(z.string())
    .min(1, { message: "Au moins un projet est requis" }),

  skillsIds: z
    .array(z.string())
    .min(1, { message: "Au moins une compétence est requise" }),

  educationsIds: z
    .array(z.string())
    .min(1, { message: "Au moins une formation est requise" }),
});

export type CvWithRelations = CvVersion & {
  Experiences: Array<{
    experience: {
      id: string;
      company: string;
      role: string;
    };
  }>;
  Projects: Array<{
    project: {
      id: string;
      name: string;
    };
  }>;
  Skills: Array<{
    Skill: {
      id: string;
      name: string;
    };
  }>;
  Educations: Array<{
    Education: {
      id: string;
      school: string;
      degree: string | null;
    };
  }>;
};
