"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import { profileInput } from "~/lib/models/Profile";
import { useForm } from "react-hook-form";

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
import { Input } from "~/app/_components/ui/input";

import type { ProfileUpsertProps } from "./type";
import { Textarea } from "../ui/textarea";
import CustomLexicalEditor from "../lexical/LexicalEditor";
import { Suspense } from "react";

export const ProfileUpsertForm: React.FC<ProfileUpsertProps> = ({
  profile,
}) => {
  const router = useRouter();

  const upsertProfile = api.profile.upsert.useMutation({
    onSuccess: () => {
      router.push("/admin");
    },
    onError: (e) => {
      console.error("Erreur lors de l'enregistrement du profil", e);
    },
  });

  async function onSubmit(values: z.infer<typeof profileInput>) {
    toast.promise(upsertProfile.mutateAsync({ ...values }), {
      loading: "Enregistrement du profil...",
      success: "Profil enregistré",
      error: "Erreur lors de l'enregistrement du profil",
    });
  }

  const form = useForm<z.infer<typeof profileInput>>({
    resolver: zodResolver(profileInput),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      headline: profile?.headline ?? undefined,
      location: profile?.location ?? undefined,
      website: profile?.website ?? undefined,
      email: profile?.email ?? undefined,
      jobTitle: profile?.jobTitle ?? undefined,
      phone: profile?.phone ?? undefined,
      aboutMd: profile?.aboutMd ?? undefined,
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
            name="fullName"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Nom complet
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Milo CARTAL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Votre poste</FormLabel>
                <FormControl>
                  <Input placeholder="Développeur Frontend" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/3">
                <FormLabel className="gap-1">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="exemple@domaine.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/3">
                <FormLabel className="gap-1">Numéro de téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="06 12 34 56 78" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/3">
                <FormLabel>Votre site web</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.oktopod.com"
                    type="url"
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
          name="location"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="gap-1">Localisation</FormLabel>
              <FormControl>
                <Textarea placeholder="Votre localisation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="gap-1">Phrase d&apos;accroche</FormLabel>
              <FormControl>
                <Textarea placeholder="Votre phrase d'accroche" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aboutMd"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="gap-1">À propos</FormLabel>
              <Suspense fallback={<div>Chargement de l&apos;éditeur...</div>}>
                <CustomLexicalEditor
                  onChangeJSON={field.onChange}
                  initialContent={field.value}
                  placeholder="Votre description"
                />
              </Suspense>
              <FormMessage />
            </FormItem>
          )}
        />

        <Fieldset className="justify-center">
          <Button
            type="submit"
            disabled={upsertProfile.isPending}
            className="mt-4 self-end"
          >
            {upsertProfile.isPending
              ? "Enregistrement..."
              : "Enregistrer le profil"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={upsertProfile.isPending}
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
