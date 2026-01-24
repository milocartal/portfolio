import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { DataTableLink } from "~/app/_components/link";

export default async function Links() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const links = await db.link.findMany();

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <DataTableLink data={links}>
            <Link href="/admin/links/new" className="w-full lg:w-auto">
              Créer un nouveau lien
            </Link>
          </DataTableLink>
        </div>
      </main>
    </HydrateClient>
  );
}
