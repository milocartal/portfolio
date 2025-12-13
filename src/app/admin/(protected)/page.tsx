import { forbidden, unauthorized } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code,
  User,
  Eye,
  Plus,
  Settings,
} from "lucide-react";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
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

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).readAny("admin").granted) {
    forbidden();
  }

  // Récupérer toutes les données nécessaires
  const [profile, experiences, educations, skills, projects, users] =
    await Promise.all([
      db.profile.findFirst({ where: { id: "profile" } }),
      db.experience.findMany({ orderBy: { startDate: "desc" } }),
      db.education.findMany({ orderBy: { startDate: "desc" } }),
      db.skill.findMany({ orderBy: { orderIndex: "asc" } }),
      db.project.findMany({ orderBy: { orderIndex: "asc" } }),
      db.user.findMany(),
    ]);

  // Calculer des statistiques
  const stats = {
    experiences: experiences.length,
    educations: educations.length,
    skills: skills.length,
    projects: projects.length,
    users: users.length,
    recentExperiences: experiences.filter(
      (exp) => !exp.endDate || new Date(exp.endDate) > new Date(),
    ).length,
    completedProjects: projects.filter((p) => p.url ?? p.repoUrl).length,
  };

  // Dernières mises à jour
  const recentUpdates = [
    ...experiences.map((e) => ({ ...e, type: "experience" as const })),
    ...educations.map((e) => ({ ...e, type: "education" as const })),
    ...projects.map((p) => ({ ...p, type: "project" as const })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <HydrateClient>
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Bienvenue {session.user.name ?? session.user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Voir le site
                </Button>
              </Link>
              <Link href="/admin/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expériences
                </CardTitle>
                <Briefcase className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.experiences}</div>
                <p className="text-muted-foreground text-xs">
                  {stats.recentExperiences} en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets</CardTitle>
                <FolderGit2 className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects}</div>
                <p className="text-muted-foreground text-xs">
                  {stats.completedProjects} publiés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compétences
                </CardTitle>
                <Code className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.skills}</div>
                <p className="text-muted-foreground text-xs">
                  Technologies maîtrisées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Formations
                </CardTitle>
                <GraduationCap className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.educations}</div>
                <p className="text-muted-foreground text-xs">
                  Diplômes et certifications
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Créer ou modifier du contenu</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link href="/admin/experiences/new">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle expérience
                  </Button>
                </Link>
                <Link href="/admin/projects/new">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau projet
                  </Button>
                </Link>
                <Link href="/admin/skills/new">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle compétence
                  </Button>
                </Link>
                <Link href="/admin/educations/new">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle formation
                  </Button>
                </Link>
                <Separator />
                <Link href="/admin/profile">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <User className="h-4 w-4" />
                    Modifier le profil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Mises à jour récentes</CardTitle>
                <CardDescription>Les 5 dernières modifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentUpdates.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucune mise à jour récente
                  </p>
                ) : (
                  recentUpdates.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded">
                        {item.type === "experience" && (
                          <Briefcase className="h-4 w-4" />
                        )}
                        {item.type === "education" && (
                          <GraduationCap className="h-4 w-4" />
                        )}
                        {item.type === "project" && (
                          <FolderGit2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {item.type === "experience" &&
                            "role" in item &&
                            item.role}
                          {item.type === "education" &&
                            "degree" in item &&
                            item.degree}
                          {item.type === "project" &&
                            "name" in item &&
                            item.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Mis à jour{" "}
                          {new Date(item.updatedAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {item.type === "experience" && "Exp."}
                        {item.type === "education" && "Édu."}
                        {item.type === "project" && "Proj."}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Overview */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Aperçu du profil</CardTitle>
                <CardDescription>
                  Informations affichées sur la page d&apos;accueil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Nom complet
                    </div>
                    <div className="text-sm font-medium">
                      {profile.fullName}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Titre du poste
                    </div>
                    <div className="text-sm font-medium">
                      {profile.jobTitle ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Email
                    </div>
                    <div className="text-sm font-medium">
                      {profile.email ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Localisation
                    </div>
                    <div className="text-sm font-medium">
                      {profile.location ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Site web
                    </div>
                    <div className="text-sm font-medium">
                      {profile.website ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                      Téléphone
                    </div>
                    <div className="text-sm font-medium">
                      {profile.phone ?? "—"}
                    </div>
                  </div>
                </div>
                {profile.headline && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-muted-foreground mb-2 text-xs font-medium uppercase">
                        Headline
                      </div>
                      <p className="text-sm">{profile.headline}</p>
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Link href="/admin/profile">
                    <Button variant="outline" size="sm">
                      Modifier le profil
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      Voir sur le site
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Management */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Experiences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Expériences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experiences.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucune expérience
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {experiences.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="rounded-lg border p-2">
                          <p className="text-sm font-medium">{exp.role}</p>
                          <p className="text-muted-foreground text-xs">
                            {exp.company}
                          </p>
                        </div>
                      ))}
                    </div>
                    {experiences.length > 3 && (
                      <p className="text-muted-foreground text-center text-xs">
                        +{experiences.length - 3} de plus
                      </p>
                    )}
                  </>
                )}
                <Link href="/admin/experiences">
                  <Button variant="outline" size="sm" className="w-full">
                    Gérer les expériences
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FolderGit2 className="h-5 w-5" />
                  Projets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucun projet</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="rounded-lg border p-2">
                          <p className="text-sm font-medium">{project.name}</p>
                          <div className="mt-1 flex gap-1">
                            {project.url && (
                              <Badge variant="secondary" className="text-xs">
                                Démo
                              </Badge>
                            )}
                            {project.repoUrl && (
                              <Badge variant="secondary" className="text-xs">
                                Code
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {projects.length > 3 && (
                      <p className="text-muted-foreground text-center text-xs">
                        +{projects.length - 3} de plus
                      </p>
                    )}
                  </>
                )}
                <Link href="/admin/projects">
                  <Button variant="outline" size="sm" className="w-full">
                    Gérer les projets
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skills.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucune compétence
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 6).map((skill) => (
                        <Badge key={skill.id} variant="outline">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                    {skills.length > 6 && (
                      <p className="text-muted-foreground text-center text-xs">
                        +{skills.length - 6} de plus
                      </p>
                    )}
                  </>
                )}
                <Link href="/admin/skills">
                  <Button variant="outline" size="sm" className="w-full">
                    Gérer les compétences
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
