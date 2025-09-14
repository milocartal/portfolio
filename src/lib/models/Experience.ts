import { ExperienceType, type Prisma } from "@prisma/client";
import { z } from "zod";

export type ExperienceWithSkills = Prisma.ExperienceGetPayload<{
  include: { Skills: true };
}>;

export const ExperienceTypeEnum = z.nativeEnum(ExperienceType, {
  errorMap: () => ({ message: "Type d'expérience invalide" }),
});

export const experienceSchema = z
  .object({
    company: z
      .string({ required_error: "le nom de l'entreprise est requis" })
      .min(1, {
        message: "le nom de l'entreprise doit contenir au moins 1 caractère",
      }),
    companyUrl: z.string().url().optional(),
    role: z
      .string({ required_error: "le rôle est requis" })
      .min(1, { message: "le rôle doit contenir au moins 1 caractère" }),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    location: z.string().optional(),
    summaryMd: z.string().optional(),
    orderIndex: z.number().optional(),
    type: ExperienceTypeEnum,
  })
  .refine((data) => !(data.endDate && !data.startDate), {
    message: "Une date de fin ne peut pas être renseignée sans date de début.",
    path: ["startDate"],
  });

export const simplifiedExperienceSchema = z.object({
  company: z.string().min(1),
  companyUrl: z.string().url().optional(),
  role: z.string().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  summaryMd: z.string().optional(),
  orderIndex: z.number().optional(),
  type: ExperienceTypeEnum,
});

export const ExperienceTypeEnumDisplay = {
  [ExperienceType.WORK]: "Autre",
  [ExperienceType.INTERNSHIP]: "Stage",
  [ExperienceType.APPRENTICESHIP]: "Apprentissage",
  [ExperienceType.FREELANCE]: "Freelance",
  [ExperienceType.VOLUNTEER]: "Bénévolat",
  [ExperienceType.FIXED_TERM]: "CDD",
  [ExperienceType.PERMANENT]: "CDI",
};
