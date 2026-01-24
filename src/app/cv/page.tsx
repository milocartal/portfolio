import { type Metadata } from "next";
import Link from "next/link";
import { FileText, Calendar, ExternalLink } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { db } from "~/server/db";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description: "Consultez mes différentes versions de CV",
};

export default async function CvListPage() {
  const cvs = await db.cvVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      Experiences: true,
      Projects: true,
      Skills: true,
      Educations: true,
    },
  });

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Mes CV
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Découvrez mes différentes versions de curriculum vitae, adaptées à
            divers contextes professionnels
          </p>
        </div>

        {/* CV List */}
        {cvs.length === 0 ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-16 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h2 className="mb-2 text-2xl font-semibold">
                Aucun CV disponible
              </h2>
              <p className="text-muted-foreground">
                Les CV seront bientôt disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6">
            {cvs.map((cv) => (
              <Card
                key={cv.id}
                className="hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-2xl">
                        {cv.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          Créé le{" "}
                          {new Date(cv.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Thème: {cv.theme}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Link href={`/cv/${cv.slug}`}>
                      <Button className="gap-2">
                        <FileText className="h-4 w-4" />
                        Voir le CV
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {cv.Experiences.length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Expériences
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {cv.Projects.length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Projets
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {cv.Skills.length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Compétences
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {cv.Educations.length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Formations
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
