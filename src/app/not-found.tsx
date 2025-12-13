import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export default function NotFound() {
  return (
    <main className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:50px_50px]" />

      <Card className="relative z-10 w-full max-w-lg border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <FileQuestion className="text-muted-foreground h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">Page introuvable</CardTitle>
          <CardDescription className="mt-2 text-base">
            Erreur 404 - Cette page n&apos;existe pas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm">
              La page que vous recherchez a peut-être été supprimée, son nom a
              changé ou est temporairement indisponible.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Que faire maintenant ?</p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1 text-sm">
              <li>Retournez à la page d&apos;accueil</li>
              <li>Explorez mes projets et expériences</li>
              <li>Vérifiez l&apos;URL dans votre navigateur</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/">
              <Button className="w-full gap-2" size="lg">
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>

            <Link href="/projects">
              <Button variant="outline" className="w-full gap-2">
                <Search className="h-4 w-4" />
                Voir les projets
              </Button>
            </Link>
          </div>

          <div className="border-t pt-4 text-center">
            <p className="text-muted-foreground text-xs">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,
              n&apos;hésitez pas à me contacter.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
