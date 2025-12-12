import { forbidden, notFound, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
import { ExperienceUpdateForm } from "~/app/_components/experience/update";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ExperienceDetail({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!slug || !can(session).updateAny("experience").granted) {
    forbidden();
  }

  const experience = await db.experience.findUnique({ where: { id: slug } });

  if (!experience) {
    notFound();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <ExperienceUpdateForm experience={experience} />
        </div>
      </main>
    </HydrateClient>
  );
}
