import Link from "next/link";
import { FolderX, Home, ArrowLeft } from "lucide-react";

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
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <FolderX className="text-muted-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Projet introuvable</CardTitle>
          <CardDescription>
            Le projet que vous recherchez n&apos;existe pas ou a été supprimé.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/projects">
            <Button variant="default" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voir tous les projets
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
