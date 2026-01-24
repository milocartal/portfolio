import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  ExternalLink,
  Calendar,
} from "lucide-react";

import { api } from "~/trpc/server";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Separator } from "~/app/_components/ui/separator";
import { CustomLexicalReadOnly } from "~/app/_components/lexical/display";
import { db } from "~/server/db";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cv = await db.cvVersion.findUnique({ where: { slug } });

  if (!cv) {
    return {
      title: "CV non trouvé",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title: cv.title,
    description: `Curriculum Vitae - ${cv.title}`,
    openGraph: {
      title: cv.title,
      description: `Curriculum Vitae - ${cv.title}`,
      type: "profile",
      url: `${baseUrl}/cv/${cv.slug}`,
    },
  };
}

export default async function CvPage({ params }: Props) {
  const { slug } = await params;

  // Récupérer le CV avec toutes ses relations
  const cv = await db.cvVersion.findUnique({
    where: { slug },
    include: {
      Experiences: {
        include: {
          experience: true,
        },
        orderBy: {
          experience: {
            startDate: "desc",
          },
        },
      },
      Projects: {
        include: {
          project: true,
        },
        orderBy: {
          project: {
            orderIndex: "asc",
          },
        },
      },
      Skills: {
        include: {
          Skill: true,
        },
        orderBy: {
          Skill: {
            orderIndex: "asc",
          },
        },
      },
      Educations: {
        include: {
          Education: true,
        },
        orderBy: {
          Education: {
            startDate: "desc",
          },
        },
      },
    },
  });

  if (!cv) {
    notFound();
  }

  // Récupérer le profil
  const profile = await api.profile.get();

  // Parser l'ordre des sections avec un type guard approprié
  let sectionOrder: string[];
  if (typeof cv.sectionOrder === "string") {
    sectionOrder = cv.sectionOrder.split(",");
  } else if (Array.isArray(cv.sectionOrder)) {
    sectionOrder = cv.sectionOrder.filter(
      (item): item is string => typeof item === "string",
    );
  } else {
    sectionOrder = ["experience", "project", "skill", "education"];
  }

  // Mapper les sections
  const sections: Record<
    string,
    { title: string; icon: React.ReactElement; content: React.ReactElement }
  > = {
    experience: {
      title: "Expériences professionnelles",
      icon: <Briefcase className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          {cv.Experiences.map(({ experience: exp }) => (
            <Card key={exp.id}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">{exp.role}</CardTitle>
                    <CardDescription className="text-base">
                      {exp.companyUrl ? (
                        <Link
                          href={exp.companyUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {exp.company}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        exp.company
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {exp.startDate &&
                      new Date(exp.startDate).toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    {" - "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Présent"}
                  </div>
                </div>
                {exp.location && (
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {exp.location}
                  </div>
                )}
              </CardHeader>
              {exp.summaryMd && (
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <CustomLexicalReadOnly initialContent={exp.summaryMd} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ),
    },
    project: {
      title: "Projets",
      icon: <FolderGit2 className="h-6 w-6" />,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {cv.Projects.map(({ project }) => (
            <Card
              key={project.id}
              className="transition-shadow hover:shadow-lg"
            >
              {project.picture && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.picture}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {project.previewText && (
                  <CardDescription className="line-clamp-2">
                    {project.previewText}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {project.summaryMd && !project.previewText && (
                  <div className="prose prose-sm dark:prose-invert line-clamp-3 max-w-none">
                    <CustomLexicalReadOnly initialContent={project.summaryMd} />
                  </div>
                )}
                <div className="flex gap-2">
                  {project.url && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={project.url} target="_blank">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Démo
                      </Link>
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={project.repoUrl} target="_blank">
                        <FolderGit2 className="mr-1 h-3 w-3" />
                        Code
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    skill: {
      title: "Compétences",
      icon: <Code className="h-6 w-6" />,
      content: (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {cv.Skills.map(({ Skill: skill }) => (
                <Badge key={skill.id} variant="secondary" className="text-sm">
                  {skill.name}
                  {skill.level && ` • ${skill.level}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    education: {
      title: "Formation",
      icon: <GraduationCap className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          {cv.Educations.map(({ Education: edu }) => (
            <Card key={edu.id}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">{edu.school}</CardTitle>
                    {edu.degree && (
                      <CardDescription className="text-base">
                        {edu.degree}
                      </CardDescription>
                    )}
                  </div>
                  {(edu.startDate ?? edu.endDate) && (
                    <div className="text-muted-foreground text-sm">
                      {edu.startDate &&
                        new Date(edu.startDate).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })}
                      {edu.startDate && edu.endDate && " - "}
                      {edu.endDate &&
                        new Date(edu.endDate).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })}
                    </div>
                  )}
                </div>
              </CardHeader>
              {edu.detailsMd && (
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <CustomLexicalReadOnly initialContent={edu.detailsMd} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ),
    },
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        {/* Header */}
        <section className="from-muted/50 to-background mb-8 rounded-lg border bg-gradient-to-b p-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {profile?.fullName ?? "Curriculum Vitae"}
            </h1>
            {profile?.headline && (
              <p className="text-muted-foreground mb-6 text-xl">
                {profile.headline}
              </p>
            )}
            {profile?.jobTitle && (
              <div className="mb-6 flex items-center justify-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                <span>{profile.jobTitle}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="text-muted-foreground mb-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              {profile?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <Link
                  href={`mailto:${profile.email}`}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </Link>
              )}
              {profile?.website && (
                <Link
                  href={profile.website}
                  target="_blank"
                  className="hover:text-foreground flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </Link>
              )}
            </div>

            {/* CV Info */}
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                Version: {cv.title}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Thème: {cv.theme}
              </Badge>
            </div>
          </div>
        </section>

        <Separator className="mb-8" />

        {/* CV Content */}
        <div className="mx-auto max-w-6xl space-y-12">
          {sectionOrder.map((sectionKey) => {
            const section = sections[sectionKey];
            if (!section) return null;

            return (
              <section key={sectionKey}>
                <div className="mb-6 flex items-center gap-2">
                  {section.icon}
                  <h2 className="text-3xl font-bold">{section.title}</h2>
                </div>
                {section.content}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t pt-8">
          <div className="text-muted-foreground text-center text-sm">
            <p>
              © {new Date().getFullYear()} {profile?.fullName ?? "Portfolio"}.
              Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
