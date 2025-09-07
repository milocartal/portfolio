import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import "~/styles/globals.css";
import { HydrateClient } from "~/trpc/server";
import { DataTableEducation } from "~/app/_components/education";

export default async function Educations() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const educations = await db.education.findMany({
    include: {
      Skills: true,
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableEducation data={educations}>
            <Link href="/admin/educations/new" className="w-full lg:w-auto">
              Créer une formation / diplôme
            </Link>
          </DataTableEducation>
        </div>
      </main>
    </HydrateClient>
  );
}
