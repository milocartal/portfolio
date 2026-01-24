"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { type z } from "zod";
import { cvSchema } from "~/lib/models/Cv";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { Checkbox } from "~/app/_components/ui/checkbox";
import type { CvUpdateProps } from "./type";

const SECTION_ORDER_OPTIONS = [
  {
    value: "experience,project,skill,education",
    label: "Expériences → Projets → Compétences → Formation",
  },
  {
    value: "education,experience,project,skill",
    label: "Formation → Expériences → Projets → Compétences",
  },
  {
    value: "skill,experience,project,education",
    label: "Compétences → Expériences → Projets → Formation",
  },
];

export const CvUpdateForm: React.FC<CvUpdateProps> = ({ cv }) => {
  const router = useRouter();

  const { data: experiences } = api.experience.getAll.useQuery();
  const { data: projects } = api.project.getAll.useQuery();
  const { data: skills } = api.skill.getAll.useQuery();
  const { data: educations } = api.education.getAll.useQuery();
  const { data: cvData } = api.cv.getById.useQuery({ id: cv.id });

  const updateCv = api.cv.update.useMutation({
    onSuccess: () => {
      router.push("/admin/cvs");
    },
    onError: (e) => {
      console.error("Erreur lors de la mise à jour du CV", e);
    },
  });

  async function onSubmit(values: z.infer<typeof cvSchema>) {
    toast.promise(updateCv.mutateAsync({ ...values, id: cv.id }), {
      loading: "Mise à jour du CV...",
      success: "CV mis à jour avec succès",
      error: "Erreur lors de la mise à jour du CV",
    });
  }

  const form = useForm<z.infer<typeof cvSchema>>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      title: cv.title,
      slug: cv.slug,
      theme: cv.theme,
      sectionOrder:
        typeof cv.sectionOrder === "string"
          ? cv.sectionOrder
          : JSON.stringify(cv.sectionOrder),
      experiencesIds: cvData?.Experiences.map((exp) => exp.experienceId) ?? [],
      projectsIds: cvData?.Projects.map((proj) => proj.projectId) ?? [],
      skillsIds: cvData?.Skills.map((skill) => skill.skillId) ?? [],
      educationsIds: cvData?.Educations.map((edu) => edu.educationId) ?? [],
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
            name="title"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Titre du CV
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="CV Développeur Full-Stack" {...field} />
                </FormControl>
                <FormDescription>
                  Le titre de cette version de CV
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Slug
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input placeholder="dev-fullstack" {...field} />
                </FormControl>
                <FormDescription>
                  URL unique pour accéder à ce CV (ex: cv/dev-fullstack)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel>Thème</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Style visuel du CV</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sectionOrder"
            render={({ field }) => (
              <FormItem className="w-full lg:w-1/2">
                <FormLabel className="gap-1">
                  Ordre des sections
                  <RequiredAsterisk />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'ordre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SECTION_ORDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  L&apos;ordre d&apos;affichage des sections dans le CV
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        {/* Expériences */}
        <Fieldset>
          <FormField
            control={form.control}
            name="experiencesIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="gap-1">
                    Expériences
                    <RequiredAsterisk />
                  </FormLabel>
                  <FormDescription>
                    Sélectionnez les expériences à inclure dans ce CV
                  </FormDescription>
                </div>
                <div className="h-[200px] overflow-auto rounded-md border p-4">
                  {experiences?.map((exp) => (
                    <FormField
                      key={exp.id}
                      control={form.control}
                      name="experiencesIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={exp.id}
                            className="flex flex-row items-start space-y-0 space-x-3 py-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(exp.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, exp.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== exp.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {exp.role} - {exp.company}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        {/* Projets */}
        <Fieldset>
          <FormField
            control={form.control}
            name="projectsIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="gap-1">
                    Projets
                    <RequiredAsterisk />
                  </FormLabel>
                  <FormDescription>
                    Sélectionnez les projets à inclure dans ce CV
                  </FormDescription>
                </div>
                <div className="h-[200px] overflow-auto rounded-md border p-4">
                  {projects?.map((project) => (
                    <FormField
                      key={project.id}
                      control={form.control}
                      name="projectsIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={project.id}
                            className="flex flex-row items-start space-y-0 space-x-3 py-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(project.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        project.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== project.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {project.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        {/* Compétences */}
        <Fieldset>
          <FormField
            control={form.control}
            name="skillsIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="gap-1">
                    Compétences
                    <RequiredAsterisk />
                  </FormLabel>
                  <FormDescription>
                    Sélectionnez les compétences à inclure dans ce CV
                  </FormDescription>
                </div>
                <div className="h-[200px] overflow-auto rounded-md border p-4">
                  {skills?.map((skill) => (
                    <FormField
                      key={skill.id}
                      control={form.control}
                      name="skillsIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={skill.id}
                            className="flex flex-row items-start space-y-0 space-x-3 py-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(skill.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, skill.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== skill.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {skill.name}
                              {skill.level && ` (${skill.level})`}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        {/* Formations */}
        <Fieldset>
          <FormField
            control={form.control}
            name="educationsIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="gap-1">
                    Formations
                    <RequiredAsterisk />
                  </FormLabel>
                  <FormDescription>
                    Sélectionnez les formations à inclure dans ce CV
                  </FormDescription>
                </div>
                <div className="h-[200px] overflow-auto rounded-md border p-4">
                  {educations?.map((edu) => (
                    <FormField
                      key={edu.id}
                      control={form.control}
                      name="educationsIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={edu.id}
                            className="flex flex-row items-start space-y-0 space-x-3 py-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(edu.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, edu.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== edu.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {edu.school}
                              {edu.degree && ` - ${edu.degree}`}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>

        <div className="flex gap-2">
          <Button type="submit" disabled={updateCv.isPending}>
            Mettre à jour le CV
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
};
