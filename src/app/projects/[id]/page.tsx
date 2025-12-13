import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Github, ArrowLeft, Calendar, Code } from "lucide-react";

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
import type { ProjectWithSkills } from "~/lib/models/Project";
import { generateProjectSchema } from "~/lib/structured-data";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await api.project.getById({ id }).catch(() => null);

  if (!project) {
    return {
      title: "Projet non trouvé",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const description =
    project.summaryMd?.substring(0, 160) ?? `Projet ${project.name}`;

  return {
    title: project.name,
    description,
    openGraph: {
      title: project.name,
      description,
      type: "article",
      url: `${baseUrl}/projects/${project.id}`,
      publishedTime: project.createdAt.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = (await api.project.getById({
    id,
  })) as ProjectWithSkills | null;

  if (!project) {
    notFound();
  }

  // Générer le structured data pour le SEO
  const projectSchema = await generateProjectSchema(id);

  return (
    <main className="bg-background min-h-screen">
      {/* JSON-LD Structured Data */}
      {projectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
        />
      )}

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
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {project.name}
          </h1>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={project.createdAt.toISOString()}>
                {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                })}
              </time>
            </div>

            {project.updatedAt.getTime() !== project.createdAt.getTime() && (
              <div className="text-muted-foreground text-xs">
                Mis à jour le{" "}
                {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.url && (
              <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Voir le projet
                </Button>
              </Link>
            )}
            {project.repoUrl && (
              <Link
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  Code source
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {project.summaryMd ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <CustomLexicalReadOnly initialContent={project.summaryMd} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Aucune description disponible.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Technologies */}
            {project.Skills && project.Skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="h-5 w-5" />
                    Technologies
                  </CardTitle>
                  <CardDescription>
                    Compétences utilisées dans ce projet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.Skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                    Créé le
                  </div>
                  <div className="text-sm">
                    {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                    Dernière mise à jour
                  </div>
                  <div className="text-sm">
                    {new Date(project.updatedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {(project.url ?? project.repoUrl) && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                        Liens
                      </div>
                      <div className="space-y-2">
                        {project.url && (
                          <Link
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-2 text-sm hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Site web
                          </Link>
                        )}
                        {project.repoUrl && (
                          <Link
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-2 text-sm hover:underline"
                          >
                            <Github className="h-3 w-3" />
                            Repository
                          </Link>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
