import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
import { ProfileUpsertForm } from "~/app/_components/profile";
import { db } from "~/server/db";

export default async function NewSkill() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).createAny("skill").granted) {
    forbidden();
  }

  const profile = await db.profile.findFirst({
    where: { id: "profile" },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <ProfileUpsertForm profile={profile} />
        </div>
      </main>
    </HydrateClient>
  );
}
