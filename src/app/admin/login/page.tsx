import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { LoginForm } from "~/app/_components/connection/form";
import { redirect } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session) {
    redirect("/admin");
  }

  return (
    <HydrateClient>
      <main className="from-background to-muted relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-4">
        {/* Background Pattern */}
        <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:50px_50px]" />

        {/* Back to home button */}
        <div className="absolute top-4 left-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-4 text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Shield className="text-primary h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Administration
                </CardTitle>
                <CardDescription className="mt-2">
                  Connectez-vous pour accéder au tableau de bord
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <LoginForm />

              {/* Additional info */}
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card text-muted-foreground px-2">
                      Accès sécurisé
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-center text-xs">
                  Cette zone est réservée aux administrateurs du portfolio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer info */}
          <p className="text-muted-foreground mt-4 text-center text-xs">
            Authentification sécurisée avec NextAuth.js
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
