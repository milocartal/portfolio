import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import "~/styles/globals.css";
import { HydrateClient } from "~/trpc/server";
import { DataTableSkill } from "~/app/_components/skill";

export default async function Skills() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const skills = await db.skill.findMany();

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableSkill data={skills}>
            <Link href="/admin/experiences/new" className="w-full lg:w-auto">
              Créer une expérience professionnelle
            </Link>
          </DataTableSkill>
        </div>
      </main>
    </HydrateClient>
  );
}
