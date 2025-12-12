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

import { Suspense } from "react";
import CustomLexicalEditor from "../lexical/LexicalEditor";

export const ProjectCreateForm: React.FC = () => {
  const router = useRouter();

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
    onError: (e) => {
      console.error("Erreur lors de la création de l'expérience scolaire", e);
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    toast.promise(createProject.mutateAsync(values), {
      loading: "Création de l'expérience scolaire...",
      success: "Expérience scolaire créée",
      error: "Erreur lors de la création de l'expérience scolaire",
    });
  }

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      summaryMd: undefined,
      url: undefined,
      repoUrl: undefined,
      orderIndex: undefined,
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
                <FormDescription>
                  Plus la valeur est basse, plus le projet sera affiché en haut.
                  Si vous laissez vide, le projet sera ajouté à la fin de la
                  liste.
                </FormDescription>
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
            disabled={createProject.isPending}
            className="mt-4 self-end"
          >
            {createProject.isPending ? "Création..." : "Créer le projet"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={createProject.isPending}
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
