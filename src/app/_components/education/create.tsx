"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import { educationSchema } from "~/lib/models/Education";
import { useForm } from "react-hook-form";

import { Button } from "~/app/_components/ui/button";
import { Calendar } from "~/app/_components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";

import { cn } from "~/lib/utils";
import { format } from "date-fns/format";
import { CalendarIcon } from "lucide-react";

export const EducationCreateForm: React.FC = () => {
  const router = useRouter();

  const createEducation = api.education.create.useMutation({
    onSuccess: () => {
      router.push("/admin/educations");
    },
    onError: (e) => {
      console.error("Erreur lors de la création de l'expérience scolaire", e);
    },
  });

  async function onSubmit(values: z.infer<typeof educationSchema>) {
    toast.promise(createEducation.mutateAsync(values), {
      loading: "Création de l'expérience scolaire...",
      success: "Expérience scolaire créée",
      error: "Erreur lors de la création de l'expérience scolaire",
    });
  }

  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      school: "",
      degree: "",
      startDate: undefined,
      endDate: undefined,
      detailsMd: undefined,
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
            name="school"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Nom de l&apos;établissement
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Lycée Saint-Sylvain de Levy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Nom du diplôme</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Baccalauréat Spécialité Connerie..."
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
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col lg:w-1/2">
                <FormLabel>Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col lg:w-1/2">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset className="justify-center">
          <Button
            type="submit"
            disabled={createEducation.isPending}
            className="mt-4 self-end"
          >
            {createEducation.isPending
              ? "Création..."
              : "Créer l'expérience scolaire"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={createEducation.isPending}
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
