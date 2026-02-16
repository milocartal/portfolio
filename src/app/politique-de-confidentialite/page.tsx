import { type Metadata } from "next";
import Link from "next/link";

import { api } from "~/trpc/server";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  description: "Politique de confidentialite et protection des donnees.",
};

export default async function PrivacyPolicyPage() {
  const profile = await api.profile.get().catch(() => null);
  const fullName = profile?.fullName ?? "Portfolio";
  const email = profile?.email ?? "non communiquee";

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            Retour a l&apos;accueil
          </Button>
        </Link>

        <div className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Politique de confidentialite
            </h1>
            <p className="text-muted-foreground">
              Politique de confidentialite et protection des donnees.
            </p>
            <Badge variant="secondary">
              Derniere mise a jour : 16 fevrier 2026
            </Badge>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Responsable du traitement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{fullName}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donnees collectees</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Ce site ne collecte que les donnees strictement necessaires a son
              fonctionnement. Cela peut inclure des donnees techniques (logs,
              adresse IP, navigateur) et, le cas echeant, des informations de
              compte pour l&apos;espace d&apos;administration.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finalites</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc space-y-1 pl-5">
                <li>Assurer le fonctionnement et la securite du site.</li>
                <li>Administrer le contenu via l&apos;espace prive.</li>
                <li>
                  Ameliorer le site en cas d&apos;analyse d&apos;audience
                  activee.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base legale</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Le traitement repose sur l&apos;interet legitime de l&apos;editeur
              a securiser et administrer le site, et sur le consentement lorsque
              des cookies non essentiels sont utilises.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conservation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Les donnees sont conservees le temps necessaire aux finalites
              indiquees et supprimees ou anonymisees ensuite, sauf obligation
              legale contraire.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destinataires</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Les donnees sont accessibles uniquement par l&apos;editeur et ses
              prestataires techniques, lorsque cela est indispensable.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Des cookies techniques peuvent etre utilises pour maintenir la
              session d&apos;administration et assurer la securite du site. Les
              cookies de mesure d&apos;audience ne sont actives que si
              configurees.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              Vous disposez de droits d&apos;acces, de rectification,
              d&apos;effacement, d&apos;opposition et de portabilite. Vous
              pouvez exercer ces droits en contactant : {email}.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Pour toute question relative a la confidentialite, ecrivez a :{" "}
              {email}.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
