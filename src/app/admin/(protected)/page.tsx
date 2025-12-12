import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";

import { can } from "~/utils/accesscontrol";
import { CustomLexicalReadOnly } from "../../_components/lexical/display";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).readAny("admin").granted) {
    forbidden();
  }

  const profile = await db.profile.findFirst({
    where: { id: "profile" },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          Le dashboard admin
        </div>

        {profile && (
          <CustomLexicalReadOnly
            initialContent={profile.aboutMd ?? undefined}
          />
        )}
      </main>
    </HydrateClient>
  );
}
