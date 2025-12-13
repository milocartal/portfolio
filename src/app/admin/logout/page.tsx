"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await signOut({ redirect: false });

      // Attendre un peu puis rediriger
      setTimeout(() => {
        router.push("/admin/login");
        router.refresh();
      }, 1500);
    };

    void performLogout();
  }, [router]);

  return (
    <main className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <LogOut className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Déconnexion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
            <p className="text-muted-foreground">Déconnexion en cours...</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
