"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Button } from "~/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";
import { useState } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";

const LoginSchema = z.object({
  email: z
    .string({ required_error: "L'email est requis" })
    .email({ message: "L'email doit être valide" })
    .min(1, "L'email est requis"),
  password: z
    .string({ required_error: "Le mot de passe est requis" })
    .min(5, "Le mot de passe doit contenir au moins 5 caractères")
    .max(64, "Le mot de passe doit faire entre 5 et 64 caractères"),
});

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function toggleIsVisible() {
    setIsVisible(!isVisible);
  }

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error("Identifiants incorrects", {
          description: "Veuillez vérifier votre email et mot de passe.",
        });
      } else {
        toast.success("Connexion réussie !", {
          description: "Redirection vers le tableau de bord...",
        });

        // Petit délai pour que l'utilisateur voie le toast
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Erreur de connexion", {
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="admin@exemple.com"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mot de passe
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={isVisible ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={toggleIsVisible}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Toggle password visibility"
                  >
                    {isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2 w-full gap-2"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Connexion...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Se connecter
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
