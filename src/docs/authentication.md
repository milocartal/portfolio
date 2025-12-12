# Authentification & Autorisation

## 🔐 Vue d'ensemble

L'application utilise **NextAuth.js v5** (beta) pour l'authentification et **AccessControl** pour la gestion des permissions basées sur les rôles (RBAC).

## 🎫 NextAuth.js Configuration

### Configuration de base

```typescript
// src/server/auth/config.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { verify } from "argon2";

export const authConfig = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "exemple@cart-all.io",
        },
        password: {
          label: "Mot de passe",
          type: "password",
          placeholder: "******",
        },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await verify(
          user.passwordHash,
          credentials.password as string,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const user = await db.user.findUnique({
          where: { email: session.user.email! },
        });
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
```

### Export de la fonction auth

```typescript
// src/server/auth/index.ts
import NextAuth from "next-auth";
import { authConfig } from "./config";

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
```

## 🔑 Providers

### Credentials Provider (Email/Password)

L'application utilise actuellement uniquement l'authentification par email/mot de passe.

**Flux d'authentification :**

1. L'utilisateur soumet son email et mot de passe
2. NextAuth.js appelle la fonction `authorize()`
3. La fonction vérifie si l'utilisateur existe
4. Le mot de passe est vérifié avec Argon2
5. Si valide, retourne l'objet utilisateur
6. NextAuth.js crée un JWT avec les infos de l'utilisateur

### Hachage des mots de passe (Argon2)

```typescript
import { hash, verify } from "argon2";

// Lors de la création d'un utilisateur
const passwordHash = await hash(password);
await db.user.create({
  data: { email, passwordHash, role: "viewer" }
});

// Lors de la connexion
const isValid = await verify(user.passwordHash, password);
```

**Pourquoi Argon2 ?**
- Plus sécurisé que bcrypt
- Résistant aux attaques GPU
- Gagnant du Password Hashing Competition
- Standard recommandé en 2024

## 👤 Gestion des sessions

### Stratégie JWT

L'application utilise des **JWT (JSON Web Tokens)** pour les sessions :

**Avantages :**
- Pas de stockage serveur nécessaire
- Scalabilité horizontale facile
- Fonctionne avec les edge functions

**Flux de session :**

```
1. Connexion → JWT créé avec { id, email }
2. JWT stocké dans un cookie httpOnly
3. Chaque requête → JWT vérifié automatiquement
4. Données utilisateur récupérées de la DB (callback session)
```

### Récupération de la session

#### Côté serveur (Server Components)

```typescript
import { auth } from "~/server/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    return <div>Non authentifié</div>;
  }
  
  return <div>Bonjour {session.user.name}</div>;
}
```

#### Côté client (Client Components)

```typescript
"use client";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Chargement...</div>;
  if (status === "unauthenticated") return <div>Non connecté</div>;
  
  return <div>Bonjour {session.user.name}</div>;
}
```

### Middleware de session avec tRPC

```typescript
// src/server/api/trpc.ts
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Procédure protégée
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
```

## 🛡️ Système de rôles (RBAC)

### Rôles disponibles

```typescript
export enum GlobalRolesEnum {
  VIEWER = "viewer",
  ADMIN = "admin",
}
```

#### Viewer (par défaut)
- Lecture des contenus publics
- Aucun accès à l'administration
- Peut créer son propre CV

#### Admin
- Accès complet à l'interface d'administration
- CRUD sur toutes les entités (Users, Experiences, Skills, etc.)
- Gestion des utilisateurs et des permissions

### AccessControl Configuration

```typescript
// src/utils/accesscontrol.ts
import { AccessControl } from "accesscontrol";

export const ac = new AccessControl();

// Permissions pour viewer
ac.grant("viewer")
  .readAny("public")
  .createOwn("cv")
  .readAny("cv")
  .readAny("education")
  .readAny("experience")
  .readAny("project")
  .readAny("skill")
  .readAny("profile");

// Permissions pour admin
ac.grant("admin")
  .readAny("admin")
  .readAny("user")
  .createAny("user")
  .updateAny("user")
  .deleteAny("user")
  .createAny("education")
  .updateAny("education")
  .deleteAny("education")
  .createAny("project")
  .updateAny("project")
  .deleteAny("project")
  .createAny("skill")
  .updateAny("skill")
  .deleteAny("skill")
  .createAny("experience")
  .updateAny("experience")
  .deleteAny("experience")
  .createAny("profile")
  .updateAny("profile")
  .deleteAny("profile");
```

### Utilisation d'AccessControl

#### Helper `can()`

```typescript
export function can(session: Session | null): Query {
  let role = "viewer";
  if (!session) return ac.can(role);

  if (session.user.role.includes("admin")) role = "admin";

  return ac.can(role);
}
```

#### Dans les routers tRPC

```typescript
// src/server/api/routers/education.ts
export const educationRouter = createTRPCRouter({
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

      // Créer l'enregistrement
      return db.education.create({ data: input });
    }),
});
```

#### Dans les composants UI

```typescript
"use client";
import { useSession } from "next-auth/react";
import { can } from "~/utils/accesscontrol";

export function AdminPanel() {
  const { data: session } = useSession();
  
  if (!can(session).readAny("admin").granted) {
    return <div>Accès refusé</div>;
  }
  
  return <div>Panneau d'administration</div>;
}
```

## 🚪 Routes d'authentification

### API Routes (NextAuth.js)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;
```

**Endpoints disponibles :**
- `GET /api/auth/signin` : Page de connexion
- `POST /api/auth/signin` : Soumettre les credentials
- `GET /api/auth/signout` : Page de déconnexion
- `POST /api/auth/signout` : Déconnecter l'utilisateur
- `GET /api/auth/session` : Récupérer la session actuelle
- `GET /api/auth/csrf` : Token CSRF

### Protection des pages

#### Avec Server Components

```typescript
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/api/auth/signin");
  }
  
  if (session.user.role !== "admin") {
    redirect("/");
  }
  
  return <div>Admin content</div>;
}
```

#### Avec Middleware (Next.js)

```typescript
// middleware.ts
import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }
  
  if (isAdminRoute && req.auth.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

## 🔒 Sécurité

### Best Practices implémentées

1. **Mots de passe sécurisés**
   - Hachage avec Argon2
   - Jamais stockés en clair
   - Validation de force (recommandé)

2. **Sessions sécurisées**
   - JWT signés cryptographiquement
   - Cookies httpOnly (protection XSS)
   - Cookies secure en production (HTTPS only)
   - SameSite=Lax (protection CSRF)

3. **Protection CSRF**
   - Tokens CSRF automatiques (NextAuth.js)
   - Vérification sur chaque mutation

4. **Rate Limiting** (recommandé)
   - À implémenter pour les tentatives de connexion
   - Prévention des attaques par force brute

5. **Validation stricte**
   - Email format validé
   - Mot de passe avec exigences minimales
   - Input sanitization avec Zod

## 🧪 Tester l'authentification

### Créer un utilisateur de test

```bash
pnpm seed
```

Le script de seed crée un utilisateur admin par défaut :
- Email : `admin@example.com`
- Password : `admin123`
- Role : `admin`

### Connexion programmatique (tests)

```typescript
import { signIn } from "~/server/auth";

await signIn("credentials", {
  email: "admin@example.com",
  password: "admin123",
  redirect: false,
});
```

## 📝 Extension du système

### Ajouter un nouveau rôle

1. **Mettre à jour les énumérations**

```typescript
// src/utils/accesscontrol.ts
export enum GlobalRolesEnum {
  VIEWER = "viewer",
  EDITOR = "editor", // Nouveau rôle
  ADMIN = "admin",
}

export const GlobalRoles = ["viewer", "editor", "admin"];
```

2. **Définir les permissions**

```typescript
ac.grant("editor")
  .extend("viewer") // Hérite des permissions viewer
  .createAny("experience")
  .updateOwn("experience")
  .deleteOwn("experience");
```

3. **Mettre à jour la fonction `can()`**

```typescript
export function can(session: Session | null): Query {
  let role = "viewer";
  if (!session) return ac.can(role);

  if (session.user.role.includes("admin")) role = "admin";
  else if (session.user.role.includes("editor")) role = "editor";

  return ac.can(role);
}
```

### Ajouter un provider OAuth

```typescript
// src/server/auth/config.ts
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({ /* ... */ }),
  ],
  // ...
};
```

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [AccessControl Documentation](https://github.com/onury/accesscontrol)
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2)
- [OWASP Authentication Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
