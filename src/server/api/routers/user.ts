import { TRPCError } from "@trpc/server";
import { argon2id, hash } from "argon2";

import { z } from "zod";
import { createUserSchema } from "~/lib/models/User";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

import { can } from "~/utils/accesscontrol";

export const userRouter = createTRPCRouter({
  //Permet de recuperer l'utilisateur actuel
  getActual: protectedProcedure.query(async ({ ctx }) => {
    return await db.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
    });
  }),

  //Permet de creer un utilisateur simple
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).createAny("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
        });
      }

      const temp = await db.user.findUnique({
        where: { email: input.email },
      });
      if (temp) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashed = await hash(input.password, {
        type: argon2id,
      });

      const user = await db.user
        .create({
          data: {
            name: input.name,
            email: input.email,
            role: input.role,
            passwordHash: hashed,
            image: input.image,
          },
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      console.log(`User created: ${user.name} (${user.email})`);

      await db.auditLog.create({
        data: {
          action: "CREATE",
          targetType: "USER",
          targetId: user.id,
          authorId: ctx.session?.user.id ?? null,
        },
      });
      return user;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).updateAny("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }

      const temp = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!temp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      return await db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          image: input.image,
        },
      });
    }),

  //Permet de supprimer un utilisateur
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!can(ctx.session).deleteOwn("user").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unsufficient privileges",
          cause: "User cannot do this action based his current role",
        });
      }
      const temp = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!temp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      return await db.user.delete({ where: { id: input.id } });
    }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
