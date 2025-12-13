import { type Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft, FolderGit2 } from "lucide-react";

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
import type { ProjectWithSkills } from "~/lib/models/Project";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "Découvrez tous mes projets de développement web et applications.",
  openGraph: {
    title: "Projets",
    description:
      "Découvrez tous mes projets de développement web et applications.",
  },
};

export default async function ProjectsPage() {
  const projects = (await api.project.getAll()) as ProjectWithSkills[];

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <FolderGit2 className="h-8 w-8" />
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Mes Projets
            </h1>
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Découvrez une sélection de mes réalisations et projets personnels.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderGit2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                Aucun projet disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const projectSkills = project.Skills ?? [];

              return (
                <Card
                  key={project.id}
                  className="flex flex-col transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {project.name}
                    </CardTitle>
                    {project.summaryMd && (
                      <CardDescription className="line-clamp-3">
                        {project.summaryMd.substring(0, 150)}...
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    {/* Skills */}
                    {projectSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {projectSkills.slice(0, 5).map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                        {projectSkills.length > 5 && (
                          <Badge variant="outline">
                            +{projectSkills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full">
                          Voir plus
                        </Button>
                      </Link>

                      {project.url && (
                        <Link
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}

                      {project.repoUrl && (
                        <Link
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <Github className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
