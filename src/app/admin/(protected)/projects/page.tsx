import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { DataTableProject } from "~/app/_components/project";

export default async function Projects() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const projects = await db.project.findMany({
    include: {
      Skills: true,
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableProject data={projects}>
            <Link href="/admin/projects/new" className="w-full lg:w-auto">
              Créer un nouveau projet
            </Link>
          </DataTableProject>
        </div>
      </main>
    </HydrateClient>
  );
}
