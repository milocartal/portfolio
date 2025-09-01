// prisma/seed.ts (ou .mts/.ts)
import { AuditTargetType, PrismaClient } from "@prisma/client";
import { hash, argon2id } from "argon2";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const db = new PrismaClient();

async function main() {
  console.log("Seeding racoons...");

  /* if ((await db.user.count()) > 0) {
    console.log("Racoons are already seeded, aborting.");
    return;
  } */

  // 1) Récupération des identifiants

  let email = process.env.SEED_ADMIN_EMAIL;
  let password = process.env.SEED_ADMIN_PASSWORD;
  let name = process.env.SEED_ADMIN_NAME;
  const rl = readline.createInterface({ input, output });

  if (!email || !password || !name) {
    email = await rl.question("email de l'administrateur : ");
    password = await rl.question("mot de passe de l'administrateur : ");
    name = await rl.question("nom de l'administrateur : ");
  }

  await rl.close();

  // 2) Création de l'admin
  const hashed = await hash(password, { type: argon2id });
  const user = await db.user.upsert({
    where: { email: email },
    update: {},
    create: {
      name: name,
      email: email,
      passwordHash: hashed, // <-- correspond au schéma
      role: "admin",
    },
  });

  await db.auditLog.create({
    data: {
      action: "CREATE",
      targetType: AuditTargetType.USER,
      targetId: user.id,
      meta: { createdBy: "Seed", role: "admin" },
    },
  });

  console.log("Seeding racoons finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
