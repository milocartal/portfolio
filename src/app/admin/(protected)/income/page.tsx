import { unauthorized } from "next/navigation";

import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";

import { IncomeCalculator } from "~/app/_components/income/display";

export const metadata = {
  title: "Calculateur de revenu",
  description:
    "Calculez votre revenu net en fonction de votre chiffre d'affaires, de vos achats et de vos frais professionnels.",
};

export default async function Income() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <IncomeCalculator />
      </main>
    </HydrateClient>
  );
}
