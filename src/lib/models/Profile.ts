import z from "zod";

export const profileInput = z.object({
  fullName: z
    .string({ required_error: "Le nom complet est requis" })
    .min(1, { message: "Le nom complet doit faire au moins 1 caractère" }),
  headline: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "L'url n'est pas valide" }).optional(),
  jobTitle: z.string().optional(),
  email: z
    .string()
    .email({ message: "L'adresse mail n'est pas valide" })
    .optional(),
  phone: z.string().optional(),
  aboutMd: z.string().optional(),
});
