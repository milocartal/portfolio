import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { DataTableExperience } from "~/app/_components/experience";

export default async function Experiences() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const experiences = await db.experience.findMany({
    include: {
      Skills: true,
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableExperience data={experiences}>
            <Link href="/admin/experiences/new" className="w-full lg:w-auto">
              Créer une expérience professionnelle
            </Link>
          </DataTableExperience>
        </div>
      </main>
    </HydrateClient>
  );
}
