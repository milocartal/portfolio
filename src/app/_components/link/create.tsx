"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import { linkSchema } from "~/lib/models/Link";
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

export const CreateLink: React.FC = () => {
  const router = useRouter();

  const createLink = api.link.create.useMutation({
    onSuccess: () => {
      router.push("/admin/links");
    },
    onError: (e) => {
      console.error("Erreur lors de la création du lien", e);
    },
  });

  async function onSubmit(values: z.infer<typeof linkSchema>) {
    toast.promise(createLink.mutateAsync(values), {
      loading: "Création du lien...",
      success: "Lien créé",
      error: "Erreur lors de la création du lien",
    });
  }

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      name: undefined,
      icon: undefined,
      url: undefined,
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
                  Plus la valeur est basse, plus le lien sera affiché en haut.
                  Si vous laissez vide, le lien sera ajouté à la fin de la
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
            name="icon"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Icône du lien</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Nom du lien <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Mon super lien" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  URL du lien
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
        </Fieldset>

        <Fieldset className="justify-center">
          <Button
            type="submit"
            disabled={createLink.isPending}
            className="mt-4 self-end"
          >
            {createLink.isPending ? "Création..." : "Créer le lien"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={createLink.isPending}
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
