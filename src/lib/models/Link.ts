import z from "zod";

export const linkSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, { message: "Le nom doit faire au moins 1 caractère" })
    .max(100, { message: "Le nom doit faire au plus 100 caractères" })
    .refine((val) => val.trim().length > 0, {
      message:
        "Le nom ne peut pas être vide ou contenir uniquement des espaces",
    }),

  icon: z
    .string()
    .url({ message: "L'URL de l'icône doit être valide" })
    .optional(),

  url: z.string().url({ message: "L'URL doit être valide" }),

  orderIndex: z.coerce.number().optional(),
});
