"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";

import { Button } from "~/app/_components/ui/button";

import {
  Fieldset,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredAsterisk,
} from "~/app/_components/ui/form";
import { api } from "~/trpc/react";
import { Input } from "~/app/_components/ui/input";

import React from "react";
import { type UpdateSkillProps } from "./type";
import { skillSchema } from "~/lib/models/Skill";

export const UpdateSkill: React.FC<UpdateSkillProps> = ({ skill }) => {
  const router = useRouter();

  const updateSkill = api.skill.update.useMutation({
    onSuccess: () => {
      toast.success("Compétence de base créée mise à jour avec succès");
      router.push("/admin/skills");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur est survenue " + error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof skillSchema>) {
    await updateSkill.mutateAsync({ ...values, id: skill.id });
  }

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: skill.name,
      orderIndex: skill.orderIndex,
      level: skill.level ?? undefined,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <Fieldset>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Nom de la compétence
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="level"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Niveau de compétence</FormLabel>
                <FormControl>
                  <Input placeholder="Niveau" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset className="justify-center">
          <Button
            type="submit"
            disabled={updateSkill.isPending}
            className="mt-4 self-end"
          >
            {updateSkill.isPending
              ? "Mise à jour..."
              : "Mettre à jour la compétence"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={updateSkill.isPending}
            onClick={() => form.reset()}
            className="mt-4 self-end"
          >
            Réinitialiser le formulaire
          </Button>
        </Fieldset>
      </form>
    </Form>
  );
};
