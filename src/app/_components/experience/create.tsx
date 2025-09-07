"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import {
  experienceSchema,
  ExperienceTypeEnumDisplay,
} from "~/lib/models/Experience";
import { useForm } from "react-hook-form";

import { Button } from "~/app/_components/ui/button";
import { Calendar } from "~/app/_components/ui/calendar";
import {
  Fieldset,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";

import { cn } from "~/lib/utils";
import { format } from "date-fns/format";
import { CalendarIcon } from "lucide-react";
import { ExperienceType } from "@prisma/client";

export const ExperienceCreateForm: React.FC = () => {
  const router = useRouter();

  const createExperience = api.experience.create.useMutation({
    onSuccess: () => {
      router.push("/admin/experiences");
    },
    onError: (e) => {
      console.error("Erreur lors de la création de l'expérience scolaire", e);
    },
  });

  async function onSubmit(values: z.infer<typeof experienceSchema>) {
    toast.promise(createExperience.mutateAsync(values), {
      loading: "Création de l'expérience scolaire...",
      success: "Expérience scolaire créée",
      error: "Erreur lors de la création de l'expérience scolaire",
    });
  }

  const form = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      companyUrl: undefined,
      role: "",
      startDate: undefined,
      endDate: undefined,
      summaryMd: undefined,
      orderIndex: undefined,
      type: ExperienceType.WORK,
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
            name="company"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Nom de l&apos;entreprise{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Oktopod" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyUrl"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Site de l&apos;entreprise</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.oktopod.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <Fieldset>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Rôle au sein de l&apos;entreprise{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Développeur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>
                  Type de contrat <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ExperienceTypeEnumDisplay).map(
                      ([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Si vous ne trouvez pas votre rôle, sélectionnez
                  &quot;Autre&quot; et précisez-le dans le résumé.
                </FormDescription>
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
                <FormLabel>Date de début de contract</FormLabel>
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
            disabled={createExperience.isPending}
            className="mt-4 self-end"
          >
            {createExperience.isPending
              ? "Création..."
              : "Créer l'expérience professionnelle"}
          </Button>
          <Button
            type="reset"
            variant={"secondary"}
            disabled={createExperience.isPending}
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
