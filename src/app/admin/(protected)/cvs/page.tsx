import { unauthorized } from "next/navigation";

import { Link } from "~/app/_components/ui/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HydrateClient } from "~/trpc/server";
import { CvDataTable } from "~/app/_components/cv";

export default async function Cvs() {
  const session = await auth();

  if (!session) {
    unauthorized();
  }

  const cvs = await db.cvVersion.findMany({
    include: {
      Experiences: {
        include: {
          experience: {
            select: {
              id: true,
              company: true,
              role: true,
            },
          },
        },
      },
      Projects: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      Skills: {
        include: {
          Skill: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      Educations: {
        include: {
          Education: {
            select: {
              id: true,
              school: true,
              degree: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <HydrateClient>
      <main className="relative flex min-h-screen flex-col items-center bg-[url('/assets/images/bg.webp')] bg-cover bg-fixed px-4 py-10">
        <div className="bg-background flex h-full w-full flex-col rounded-lg px-6 py-4 shadow">
          <CvDataTable data={cvs}>
            <Link href="/admin/cvs/new" className="w-full lg:w-auto">
              Créer une version de CV
            </Link>
          </CvDataTable>
        </div>
      </main>
    </HydrateClient>
  );
}
