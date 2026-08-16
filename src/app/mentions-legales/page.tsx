import { type Metadata } from "next";
import Link from "next/link";

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
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales et crédits du site.",
};

export default async function LegalNoticePage() {
  const profile = await api.profile.get().catch(() => null);
  const fullName = profile?.fullName ?? "Portfolio";
  const email = profile?.email ?? "non communiqué";
  const location = profile?.location ?? "non communiqué";
  const website = profile?.website ?? env.NEXT_PUBLIC_APP_URL;

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            Retour à l&apos;accueil
          </Button>
        </Link>

        <div className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Mentions légales
            </h1>
            <p className="text-muted-foreground">
              Informations légales et crédits du site.
            </p>
            <Badge variant="secondary">
              Dernière mise à jour : 16 février 2026
            </Badge>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Editeur du site</CardTitle>
              <CardDescription>Informations principales</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Nom</dt>
                  <dd className="font-medium">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Localisation</dt>
                  <dd className="font-medium">{location}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Adresse email</dt>
                  <dd className="font-medium">{email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Site</dt>
                  <dd className="font-medium break-all">{website}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Directeur de publication</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{fullName}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hebergement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Hébergeur : QuantumCraft Studios SAS <br />
              58 rue de Monceau CS 48756, 75380 Paris CEDEX
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propriete intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              L&apos;ensemble des contenus (textes, images, logos, code, etc.)
              est protégé par le droit d&apos;auteur. Toute reproduction,
              modification ou réutilisation sans autorisation est interdite.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsabilite</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Les informations présentées sur ce site sont fournies à titre
              indicatif. Malgré le soin apporté, l&apos;éditeur ne peut garantir
              l&apos;exactitude ou l&apos;exhaustivité des contenus.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Pour toute question, vous pouvez écrire a : {email}.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
