import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
import { CreateUser } from "~/app/_components/user";

export default async function NewUser() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).createAny("user").granted) {
    forbidden();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <CreateUser session={session} />
        </div>
      </main>
    </HydrateClient>
  );
}
