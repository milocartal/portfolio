"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import { projectSchema } from "~/lib/models/Project";
import { useForm } from "react-hook-form";

import { Button } from "~/app/_components/ui/button";
import {
  Fieldset,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredAsterisk,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";

import type { ProjectUpdateProps } from "./type";
import { Suspense } from "react";
import CustomLexicalEditor from "../lexical/LexicalEditor";

export const ProjectUpdateForm: React.FC<ProjectUpdateProps> = ({
  project,
}) => {
  const router = useRouter();

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
    onError: (e) => {
      console.error(
        "Erreur lors de la création de l'expérience professionnelle",
        e,
      );
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    toast.promise(updateProject.mutateAsync({ ...values, id: project.id }), {
      loading: "Mise à jour de l'expérience professionnelle...",
      success: "Expérience professionnelle mise à jour",
      error: "Erreur lors de la mise à jour de l'expérience professionnelle",
    });
  }

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      summaryMd: project.summaryMd ?? undefined,
      url: project.url ?? undefined,
      repoUrl: project.repoUrl ?? undefined,
      orderIndex: project.orderIndex,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-4"
      >
        <Fieldset>
          <FormField
            control={form.control}
            name="orderIndex"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">Ordre d&apos;affichage</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1"
                    type="number"
                    min={1}
                    step={1}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Nom du projet <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Mon super projet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset>
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  URL du projet
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.projet-super-bien.cool"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repoUrl"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>URL du dépôt</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.github.com/projet-super-bien"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <FormField
          control={form.control}
          name="summaryMd"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="gap-1">À propos</FormLabel>
              <FormDescription>
                Description du projet qui sera affichée sur la page du projet.
              </FormDescription>
              <Suspense fallback={<div>Chargement de l&apos;éditeur...</div>}>
                <CustomLexicalEditor
                  onChangeJSON={field.onChange}
                  initialContent={field.value}
                  placeholder="Mon super projet est une application qui permet de..."
                />
              </Suspense>
              <FormMessage />
            </FormItem>
          )}
        />

        <Fieldset className="justify-center">
          <Button
            type="submit"
            disabled={updateProject.isPending}
            className="mt-4 self-end"
          >
            {updateProject.isPending
              ? "Mise à jour..."
              : "Mettre à jour le projet"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={updateProject.isPending}
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
