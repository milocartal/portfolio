import { forbidden, notFound, unauthorized } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { can } from "~/utils/accesscontrol";
import { UpdateLink } from "~/app/_components/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LinkDetail({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  if (!slug || !can(session).updateAny("link").granted) {
    forbidden();
  }

  const link = await db.link.findUnique({ where: { id: slug } });

  if (!link) {
    notFound();
  }

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <UpdateLink link={link} />
        </div>
      </main>
    </HydrateClient>
  );
}
