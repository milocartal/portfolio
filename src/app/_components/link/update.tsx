"use client";

import type { UpdateLinkProps } from "./type";
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

export const UpdateLink: React.FC<UpdateLinkProps> = ({ link }) => {
  const router = useRouter();

  const updateLink = api.link.update.useMutation({
    onSuccess: () => {
      router.push("/admin/links");
    },
    onError: (e) => {
      console.error("Erreur lors de la mise à jour du lien", e);
    },
  });

  async function onSubmit(values: z.infer<typeof linkSchema>) {
    toast.promise(updateLink.mutateAsync({ ...values, id: link.id }), {
      loading: "Mise à jour du lien...",
      success: "Lien mis à jour",
      error: "Erreur lors de la mise à jour du lien",
    });
  }

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      name: link.name,
      icon: link.icon ?? undefined,
      url: link.url ?? undefined,
      orderIndex: link.orderIndex,
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
            disabled={updateLink.isPending}
            className="mt-4 self-end"
          >
            {updateLink.isPending ? "Mise à jour..." : "Mettre à jour le lien"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={updateLink.isPending}
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
