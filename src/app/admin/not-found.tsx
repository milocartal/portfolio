import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, LayoutDashboard } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export default function AdminNotFound() {
  return (
    <main className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-lg border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <FileQuestion className="text-destructive h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">Page introuvable</CardTitle>
          <CardDescription className="mt-2 text-base">
            Erreur 404
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm">
              La page d&apos;administration que vous recherchez n&apos;existe
              pas ou a été déplacée.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Suggestions :</p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1 text-sm">
              <li>Vérifiez l&apos;URL dans la barre d&apos;adresse</li>
              <li>Retournez au tableau de bord</li>
              <li>Contactez un administrateur si le problème persiste</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link href="/admin">
              <Button className="w-full gap-2" size="lg">
                <LayoutDashboard className="h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin" className="w-full">
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              </Link>

              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Home className="h-4 w-4" />
                  Accueil
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
