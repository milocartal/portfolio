import Link from "next/link";
import {
  Mail,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  ExternalLink,
} from "lucide-react";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { CustomLexicalReadOnly } from "~/app/_components/lexical/display";
import {
  generatePersonSchema,
  generateWebsiteSchema,
  generatePortfolioSchema,
} from "~/lib/structured-data";
import Image from "next/image";
import { db } from "~/server/db";

export default async function Home() {
  const session = await auth();

  // Récupérer toutes les données
  const [profile, experiences, educations, skills, projects, links, cvCount] =
    await Promise.all([
      api.profile.get(),
      api.experience.getAll(),
      api.education.getAll(),
      api.skill.getAll(),
      api.project.getAll(),
      api.link.getAll(),
      db.cvVersion.count(),
    ]);

  // Générer les structured data pour le SEO
  const [personSchema, websiteSchema, portfolioSchema] = await Promise.all([
    generatePersonSchema(),
    generateWebsiteSchema(),
    generatePortfolioSchema(),
  ]);

  return (
    <HydrateClient>
      {/* JSON-LD Structured Data */}
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}
      {websiteSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      )}
      {portfolioSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(portfolioSchema),
          }}
        />
      )}

      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="from-muted/50 to-background border-b bg-gradient-to-b">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                {profile?.fullName ?? "Portfolio"}
              </h1>
              {profile?.headline && (
                <p className="text-muted-foreground mb-6 text-xl md:text-2xl">
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
              <div className="text-muted-foreground mb-8 flex flex-wrap items-center justify-center gap-4 text-sm">
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

              {/* Links Section */}
              {links && links.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {links.map((link) => (
                    <Button key={link.id} variant="outline" size="sm" asChild>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {link.icon && (
                          <Image
                            src={link.icon}
                            alt={link.name}
                            className="h-4 w-4"
                            loading="lazy"
                            width={16}
                            height={16}
                          />
                        )}
                        <span>{link.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  ))}
                </div>
              )}

              {/* Admin Link */}
              {session?.user.role === "admin" && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button asChild>
                    <Link href="/admin">Accéder à l&apos;administration</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/cv">Voir mes CV</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-6xl space-y-12">
            {/* About Section */}
            {profile?.aboutMd && (
              <section>
                <h2 className="mb-6 text-3xl font-bold">À propos</h2>
                <Card>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
                    <CustomLexicalReadOnly initialContent={profile.aboutMd} />
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Experience Section */}
            {experiences && experiences.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2">
                  <Briefcase className="h-6 w-6" />
                  <h2 className="text-3xl font-bold">
                    Expériences professionnelles
                  </h2>
                </div>
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <Card key={exp.id}>
                      <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {exp.role}
                            </CardTitle>
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
                              new Date(exp.startDate).toLocaleDateString(
                                "fr-FR",
                                { month: "short", year: "numeric" },
                              )}
                            {" - "}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString(
                                  "fr-FR",
                                  { month: "short", year: "numeric" },
                                )
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
                          <CustomLexicalReadOnly
                            initialContent={exp.summaryMd}
                          />
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {projects && projects.length > 0 && (
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-6 w-6" />
                    <h2 className="text-3xl font-bold">Projets</h2>
                  </div>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm">
                      Voir tous les projets →
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.slice(0, 4).map((project) => (
                    <Card
                      key={project.id}
                      className="transition-shadow hover:shadow-lg"
                    >
                      {project.picture && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={project.picture}
                            alt={project.name}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                            width={640}
                            height={360}
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        {project.previewText && (
                          <CardDescription className="line-clamp-2">
                            {project.previewText}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.summaryMd && !project.previewText && (
                          <div className="prose prose-sm dark:prose-invert line-clamp-3 max-w-none">
                            <CustomLexicalReadOnly
                              initialContent={project.summaryMd}
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button size="sm" variant="default">
                              Voir plus
                            </Button>
                          </Link>
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
              </section>
            )}

            {/* Skills Section */}
            {skills && skills.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2">
                  <Code className="h-6 w-6" />
                  <h2 className="text-3xl font-bold">Compétences</h2>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="secondary"
                          className="text-sm"
                        >
                          {skill.name}
                          {skill.level && ` • ${skill.level}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Education Section */}
            {educations && educations.length > 0 && (
              <section>
                <div className="mb-6 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  <h2 className="text-3xl font-bold">Formation</h2>
                </div>
                <div className="space-y-4">
                  {educations.map((edu) => (
                    <Card key={edu.id}>
                      <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {edu.school}
                            </CardTitle>
                            {edu.degree && (
                              <CardDescription className="text-base">
                                {edu.degree}
                              </CardDescription>
                            )}
                          </div>
                          {(edu.startDate ?? edu.endDate) && (
                            <div className="text-muted-foreground text-sm">
                              {edu.startDate &&
                                new Date(edu.startDate).toLocaleDateString(
                                  "fr-FR",
                                  { month: "short", year: "numeric" },
                                )}
                              {edu.startDate && edu.endDate && " - "}
                              {edu.endDate &&
                                new Date(edu.endDate).toLocaleDateString(
                                  "fr-FR",
                                  { month: "short", year: "numeric" },
                                )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {edu.detailsMd && (
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                          <CustomLexicalReadOnly
                            initialContent={edu.detailsMd}
                          />
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container mx-auto px-4">
            {cvCount > 0 && (
              <div className="mb-4 text-center">
                <Link href="/cv">
                  <Button variant="ghost" size="sm">
                    Consulter mes CV →
                  </Button>
                </Link>
              </div>
            )}
            <div className="text-muted-foreground text-center text-sm">
              <p>
                © {new Date().getFullYear()} {profile?.fullName ?? "Portfolio"}
                . Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}
