# API tRPC

## 🔌 Vue d'ensemble

L'application utilise **tRPC** pour créer des API type-safe end-to-end. Toutes les routes API sont définies dans des **routers** qui exposent des **procédures** (queries et mutations).

## 🏗️ Architecture tRPC

### Structure

```
src/server/api/
├── trpc.ts          # Configuration tRPC, middleware, procédures
├── root.ts          # Router principal, combine tous les routers
└── routers/         # Routers par domaine métier
    ├── education.ts
    ├── experience.ts
    ├── profile.ts
    ├── project.ts
    ├── skill.ts
    └── user.ts
```

### Configuration de base

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// 1. Créer le contexte (disponible dans toutes les procédures)
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  return {
    db,
    session,
    ...opts,
  };
};

// 2. Initialiser tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // Permet de passer des Date, Map, Set, etc.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// 3. Créer des helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { session: { ...ctx.session, user: ctx.session.user } },
  });
});
```

## 📦 Router principal

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from "~/server/api/trpc";
import { educationRouter } from "~/server/api/routers/education";
import { experienceRouter } from "~/server/api/routers/experience";
import { profileRouter } from "~/server/api/routers/profile";
import { projectRouter } from "~/server/api/routers/project";
import { skillRouter } from "~/server/api/routers/skill";
import { userRouter } from "~/server/api/routers/user";

export const appRouter = createTRPCRouter({
  education: educationRouter,
  experience: experienceRouter,
  profile: profileRouter,
  project: projectRouter,
  skill: skillRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

## 🎯 Routers par domaine

### Structure type d'un router

Chaque router suit un pattern CRUD standard :

```typescript
// src/server/api/routers/education.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { educationSchema } from "~/lib/models/Education";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

export const educationRouter = createTRPCRouter({
  // Query : Récupérer toutes les formations
  getAll: publicProcedure.query(async () => {
    return db.education.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }),

  // Query : Récupérer une formation par ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.education.findUnique({
        where: { id: input.id },
      });
    }),

  // Mutation : Créer une formation
  create: protectedProcedure
    .input(educationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!can(ctx.session).createAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to create education records.",
        });
      }

      // Gérer l'index d'ordre
      let index: number;
      if (input.orderIndex !== undefined) {
        index = input.orderIndex;
      } else {
        const lastEducation = await db.education.findFirst({
          orderBy: { orderIndex: "desc" },
        });
        index = lastEducation ? lastEducation.orderIndex + 1 : 0;
      }

      // Créer l'enregistrement
      return db.education.create({
        data: {
          ...input,
          orderIndex: index,
        },
      });
    }),

  // Mutation : Mettre à jour une formation
  update: protectedProcedure
    .input(
      educationSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update education records.",
        });
      }

      const { id, ...data } = input;
      return db.education.update({
        where: { id },
        data,
      });
    }),

  // Mutation : Supprimer une formation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("education").granted) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete education records.",
        });
      }

      return db.education.delete({
        where: { id: input.id },
      });
    }),
});
```

## 📡 Utilisation côté client

### Configuration du client

```typescript
// src/trpc/react.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";
import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
```

### Dans les composants React

#### Query (lecture)

```typescript
"use client";
import { api } from "~/trpc/react";

export function EducationList() {
  const { data, isLoading, error } = api.education.getAll.useQuery();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <ul>
      {data?.map((education) => (
        <li key={education.id}>{education.school}</li>
      ))}
    </ul>
  );
}
```

#### Mutation (écriture)

```typescript
"use client";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function CreateEducationForm() {
  const utils = api.useUtils();
  
  const createMutation = api.education.create.useMutation({
    onSuccess: () => {
      toast.success("Formation créée !");
      // Invalider le cache pour rafraîchir la liste
      utils.education.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: EducationInput) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Création..." : "Créer"}
      </button>
    </form>
  );
}
```

### Dans les Server Components

```typescript
import { api } from "~/trpc/server";

export default async function EducationPage() {
  const educations = await api.education.getAll();

  return (
    <div>
      <h1>Formations</h1>
      <ul>
        {educations.map((edu) => (
          <li key={edu.id}>{edu.school}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎭 Types de procédures

### Public Procedure
Accessible sans authentification.

```typescript
export const publicProcedure = t.procedure.use(timingMiddleware);

// Utilisation
getAll: publicProcedure.query(async () => {
  return db.education.findMany();
});
```

### Protected Procedure
Nécessite une authentification.

```typescript
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

// Utilisation
create: protectedProcedure
  .input(educationSchema)
  .mutation(async ({ ctx, input }) => {
    // ctx.session.user est garanti non-null
    return db.education.create({ data: input });
  });
```

## 📋 Schémas de validation (Zod)

### Définition des schémas

```typescript
// src/lib/models/Education.ts
import { z } from "zod";

export const educationSchema = z.object({
  school: z.string().min(1, "L'école est requise"),
  degree: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  detailsMd: z.string().optional(),
  orderIndex: z.number().optional(),
});

export type Education = z.infer<typeof educationSchema>;
```

### Utilisation dans tRPC

```typescript
create: protectedProcedure
  .input(educationSchema) // Validation automatique
  .mutation(async ({ input }) => {
    // input est typé et validé ✅
    return db.education.create({ data: input });
  });
```

## 🔒 Gestion des permissions

### Pattern de vérification

```typescript
import { can } from "~/utils/accesscontrol";

create: protectedProcedure
  .input(educationSchema)
  .mutation(async ({ ctx, input }) => {
    // Vérifier la permission
    if (!can(ctx.session).createAny("education").granted) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to create education records.",
      });
    }

    // Action autorisée
    return db.education.create({ data: input });
  });
```

## ⚡ Optimisations React Query

### Prefetching

```typescript
// Précharger des données
export default async function Page() {
  const api = createCaller(await createTRPCContext({ headers: new Headers() }));
  
  // Précharger côté serveur
  await api.education.getAll.prefetch();
  
  return <HydrateClient>{/* Composants */}</HydrateClient>;
}
```

### Invalidation du cache

```typescript
const utils = api.useUtils();

// Invalider une query spécifique
utils.education.getAll.invalidate();

// Invalider toutes les queries education
utils.education.invalidate();

// Refetch immédiat
utils.education.getAll.refetch();
```

### Optimistic Updates

```typescript
const updateMutation = api.education.update.useMutation({
  onMutate: async (newData) => {
    // Annuler les requêtes en cours
    await utils.education.getAll.cancel();

    // Snapshot de l'ancien état
    const previousEducations = utils.education.getAll.getData();

    // Mettre à jour optimistiquement
    utils.education.getAll.setData(undefined, (old) =>
      old?.map((edu) => (edu.id === newData.id ? { ...edu, ...newData } : edu))
    );

    return { previousEducations };
  },
  onError: (err, newData, context) => {
    // Restaurer en cas d'erreur
    utils.education.getAll.setData(undefined, context?.previousEducations);
  },
  onSettled: () => {
    // Revalider après mutation
    utils.education.getAll.invalidate();
  },
});
```

## 🎨 Patterns avancés

### Procédure avec pagination

```typescript
getAll: publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const { limit, cursor } = input;
    
    const items = await db.education.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items,
      nextCursor,
    };
  });
```

### Procédure avec subscription (temps réel)

```typescript
import { observable } from "@trpc/server/observable";

onEducationCreate: publicProcedure.subscription(() => {
  return observable<Education>((emit) => {
    const onCreate = (data: Education) => {
      emit.next(data);
    };

    // Écouter les événements
    eventEmitter.on("educationCreated", onCreate);

    return () => {
      eventEmitter.off("educationCreated", onCreate);
    };
  });
});
```

## 🐛 Gestion des erreurs

### Codes d'erreur tRPC

```typescript
throw new TRPCError({
  code: "BAD_REQUEST",        // 400
  code: "UNAUTHORIZED",       // 401
  code: "FORBIDDEN",          // 403
  code: "NOT_FOUND",          // 404
  code: "INTERNAL_SERVER_ERROR", // 500
  message: "Message d'erreur personnalisé",
});
```

### Gestion côté client

```typescript
const { data, error } = api.education.getAll.useQuery();

if (error) {
  // error.data.code : Code d'erreur
  // error.message : Message d'erreur
  // error.data.zodError : Erreurs de validation Zod
  
  if (error.data?.code === "UNAUTHORIZED") {
    return <div>Veuillez vous connecter</div>;
  }
  
  return <div>Erreur : {error.message}</div>;
}
```

## 📚 Résumé des routers disponibles

### Education Router
- `getAll()` : Liste toutes les formations
- `getById({ id })` : Récupère une formation
- `create(data)` : Crée une formation (admin)
- `update({ id, ...data })` : Met à jour (admin)
- `delete({ id })` : Supprime (admin)

### Experience Router
- `getAll()` : Liste toutes les expériences
- `getById({ id })` : Récupère une expérience
- `create(data)` : Crée une expérience (admin)
- `update({ id, ...data })` : Met à jour (admin)
- `delete({ id })` : Supprime (admin)

### Profile Router
- `get()` : Récupère le profil
- `hello({ text })` : Exemple de query
- `upsert(data)` : Crée ou met à jour le profil (admin)

### Skill Router
- `getAll()` : Liste toutes les compétences
- `getById({ id })` : Récupère une compétence
- `create(data)` : Crée une compétence (admin)
- `update({ id, ...data })` : Met à jour (admin)
- `delete({ id })` : Supprime (admin)

### Project Router
- `getAll()` : Liste tous les projets
- `getById({ id })` : Récupère un projet
- `create(data)` : Crée un projet (admin)
- `update({ id, ...data })` : Met à jour (admin)
- `delete({ id })` : Supprime (admin)

### User Router
- `getAll()` : Liste tous les utilisateurs (admin)
- `getById({ id })` : Récupère un utilisateur (admin)
- `create(data)` : Crée un utilisateur (admin)
- `update({ id, ...data })` : Met à jour (admin)
- `delete({ id })` : Supprime (admin)

## 📚 Ressources

- [tRPC Documentation](https://trpc.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
