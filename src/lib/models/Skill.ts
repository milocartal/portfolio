import { z } from "zod";

export const skillSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, "Le nom est requis"),
  level: z.string().optional(),
  orderIndex: z.number().min(0).optional(),
});
