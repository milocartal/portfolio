import { forbidden, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
import { EducationCreateForm } from "~/app/_components/education";

export default async function NewEducation() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!can(session).createAny("education").granted) {
    forbidden();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <EducationCreateForm />
        </div>
      </main>
    </HydrateClient>
  );
}
