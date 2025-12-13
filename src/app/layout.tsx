import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { TooltipProvider } from "~/app/_components/ui/tooltip";
import { Toaster } from "sonner";
import { api } from "~/trpc/server";
import { env } from "~/env";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await api.profile.get().catch(() => null);
  const skills = await api.skill.getAll().catch(() => []);

  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const fullName = profile?.fullName ?? "Portfolio";
  const jobTitle = profile?.jobTitle ?? "Développeur Full Stack";
  const location = profile?.location ?? "";

  // Générer la description
  const description = profile?.headline
    ? `${profile.headline}${location ? ` Basé à ${location}.` : ""} Découvrez mes projets et expériences professionnelles.`
    : `Portfolio de ${fullName} - ${jobTitle}. Découvrez mes projets et expériences professionnelles.`;

  // Générer les mots-clés basés sur les compétences
  const skillKeywords = skills.slice(0, 10).map((s) => s.name);
  const keywords = [
    fullName,
    "Portfolio",
    jobTitle,
    ...skillKeywords,
    "Développeur Web",
  ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${fullName} - Portfolio`,
      template: `%s | ${fullName}`,
    },
    description,
    keywords,
    authors: [
      {
        name: fullName,
        url: profile?.website ?? baseUrl,
      },
    ],
    creator: fullName,
    publisher: fullName,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: baseUrl,
      title: `${fullName} - ${jobTitle}`,
      description,
      siteName: `${fullName} Portfolio`,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${fullName} - Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName} - ${jobTitle}`,
      description,
      images: ["/opengraph-image"],
      creator:
        profile?.website?.includes("twitter.com") ||
        profile?.website?.includes("x.com")
          ? `@${profile.website.split("/").pop()}`
          : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
