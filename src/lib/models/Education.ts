import z from "zod";
import { type Prisma } from "@prisma/client";

export const educationSchema = z
  .object({
    school: z
      .string({ required_error: "Le nom de l'établissement est requis." })
      .min(1, {
        message:
          "Le nom de l'établissement doit contenir au moins 1 caractère.",
      })
      .max(255, {
        message:
          "Le nom de l'établissement ne peut pas dépasser 255 caractères.",
      }),
    degree: z
      .string({ required_error: "L'intitulé du diplôme est requis." })
      .min(1, {
        message: "L'intitulé du diplôme doit contenir au moins 1 caractère.",
      })
      .max(255, {
        message: "L'intitulé du diplôme ne peut pas dépasser 255 caractères.",
      }),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    detailsMd: z.string().optional(),
    orderIndex: z.number().optional(),
  })
  .refine((data) => !(data.endDate && !data.startDate), {
    message: "Une date de fin ne peut pas être renseignée sans date de début.",
    path: ["startDate"],
  });

export const simplifiedEducationSchema = z.object({
  school: z.string().min(1).max(255),
  degree: z.string().min(1).max(255),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  detailsMd: z.string().optional(),
  orderIndex: z.number().optional(),
});

export type EducationWithSkills = Prisma.EducationGetPayload<{
  include: {
    Skills: true;
  };
}>;
