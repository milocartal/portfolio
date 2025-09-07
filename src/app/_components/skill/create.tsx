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
} from "~/app/_components/ui/form";
import { api } from "~/trpc/react";
import { Input } from "~/app/_components/ui/input";

import React from "react";

import { skillSchema } from "~/lib/models/Skill";

export const CreateSkill: React.FC = () => {
  const router = useRouter();

  const createSkill = api.skill.create.useMutation({
    onSuccess: () => {
      toast.success("Compétence de base créée avec succès");
      router.push("/skill");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur est survenue " + error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof skillSchema>) {
    await createSkill.mutateAsync(values);
  }

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      orderIndex: undefined,
      level: undefined,
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
                <FormLabel>
                  Nom de la compétence <span className="text-red-500">*</span>
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
            disabled={createSkill.isPending}
            className="mt-4 self-end"
          >
            {createSkill.isPending ? "Création..." : "Créer la compétence"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={createSkill.isPending}
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
