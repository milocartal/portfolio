# Architecture de l'Application

## 📐 Vue d'ensemble

Ce portfolio est construit avec la **T3 Stack**, une stack TypeScript moderne et type-safe pour les applications web full-stack. L'architecture suit les principes de **séparation des préoccupations**, **type-safety**, et **developer experience optimale**.

## 🏗️ Stack technique

### Core Framework
- **Next.js 15** avec App Router
- **React 19** pour l'interface utilisateur
- **TypeScript** pour la sécurité de typage

### Backend
- **tRPC** pour les API type-safe
- **Prisma** comme ORM
- **PostgreSQL** base de données
- **NextAuth.js** pour l'authentification

### Frontend
- **Tailwind CSS 4** pour le styling
- **Radix UI** pour les composants primitifs
- **Lexical** éditeur de texte riche
- **React Query** (via tRPC) pour la gestion d'état serveur

## 🔄 Architecture en couches

```
┌─────────────────────────────────────────┐
│          Client (Browser)               │
│  ┌─────────────────────────────────┐   │
│  │    React Components             │   │
│  │    (src/app/_components)        │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    tRPC React Client            │   │
│  │    (src/trpc/react.tsx)         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕ HTTP
┌─────────────────────────────────────────┐
│          Server (Next.js)               │
│  ┌─────────────────────────────────┐   │
│  │    API Routes (App Router)      │   │
│  │    /api/trpc/[trpc]/route.ts    │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    tRPC Router                  │   │
│  │    (src/server/api/root.ts)     │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    Business Logic (Routers)     │   │
│  │    (src/server/api/routers/)    │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    Prisma ORM                   │   │
│  │    (src/server/db.ts)           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│          Database (PostgreSQL)          │
└─────────────────────────────────────────┘
```

## 📁 Structure des dossiers

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Page d'accueil publique
│   ├── layout.tsx               # Layout racine
│   ├── _components/             # Composants réutilisables
│   │   ├── ui/                  # Composants UI primitifs (shadcn/ui)
│   │   ├── navbar/              # Navigation
│   │   ├── profile/             # Gestion profil
│   │   ├── education/           # Gestion formations
│   │   ├── experience/          # Gestion expériences
│   │   ├── skill/               # Gestion compétences
│   │   ├── user/                # Gestion utilisateurs
│   │   └── lexical/             # Éditeur de texte riche
│   ├── admin/                   # Zone d'administration
│   │   ├── layout.tsx           # Layout admin
│   │   ├── page.tsx             # Dashboard admin
│   │   ├── profile/             # Admin profil
│   │   ├── educations/          # Admin formations
│   │   ├── experiences/         # Admin expériences
│   │   ├── skills/              # Admin compétences
│   │   └── users/               # Admin utilisateurs
│   └── api/                     # Routes API
│       ├── auth/                # Endpoints NextAuth
│       └── trpc/                # Endpoints tRPC
│
├── server/                       # Code serveur uniquement
│   ├── db.ts                    # Client Prisma singleton
│   ├── auth/                    # Configuration NextAuth
│   │   ├── config.ts            # Options NextAuth
│   │   └── index.ts             # Export auth
│   └── api/                     # Configuration tRPC
│       ├── trpc.ts              # Setup tRPC, middleware
│       ├── root.ts              # Router principal
│       └── routers/             # Routeurs par domaine
│           ├── education.ts
│           ├── experience.ts
│           ├── profile.ts
│           ├── project.ts
│           ├── skill.ts
│           └── user.ts
│
├── trpc/                         # Configuration client tRPC
│   ├── react.tsx                # Provider React
│   ├── server.ts                # Helper serveur
│   └── query-client.ts          # Config React Query
│
├── lib/                          # Bibliothèques partagées
│   ├── utils.ts                 # Utilitaires généraux
│   └── models/                  # Schémas Zod pour validation
│       ├── Education.ts
│       ├── Experience.ts
│       ├── Profile.ts
│       ├── Skill.ts
│       └── User.ts
│
├── utils/                        # Utilitaires métier
│   ├── accesscontrol.ts         # Gestion des permissions
│   └── withSessionProvider.tsx  # HOC pour session
│
├── hooks/                        # React hooks personnalisés
│   └── use-mobile.ts
│
├── styles/                       # Styles globaux
│   └── globals.css
│
└── env.js                        # Validation variables d'env
```

## 🎯 Patterns architecturaux

### 1. Type-Safety End-to-End

L'application utilise **tRPC** pour garantir la sécurité de type de bout en bout :

```typescript
// Serveur : définition du router
export const educationRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.education.findMany();
  }),
});

// Client : utilisation type-safe
const { data } = api.education.getAll.useQuery();
// data est typé automatiquement!
```

### 2. Server Components & Client Components

Next.js 15 avec App Router utilise les **Server Components** par défaut :

- **Server Components** : Pour le rendu côté serveur, accès direct à la DB
- **Client Components** : Marqués avec `"use client"`, pour l'interactivité

```tsx
// Server Component (par défaut)
export default async function Page() {
  const data = await api.education.getAll();
  return <EducationList data={data} />;
}

// Client Component
"use client";
export function EducationForm() {
  const [open, setOpen] = useState(false);
  // ...
}
```

### 3. Repository Pattern avec tRPC

Chaque entité (Education, Experience, etc.) a son propre **router tRPC** qui agit comme un repository :

- `getAll()` : Liste toutes les entrées
- `getById()` : Récupère une entrée spécifique
- `create()` : Crée une nouvelle entrée
- `update()` : Met à jour une entrée
- `delete()` : Supprime une entrée

### 4. Access Control Layer

Un système de permissions basé sur les rôles avec **AccessControl** :

```typescript
// Définition des permissions
ac.grant("viewer")
  .readAny("education")
  .readAny("experience");

ac.grant("admin")
  .createAny("education")
  .updateAny("education")
  .deleteAny("education");

// Utilisation dans les routers
if (!can(ctx.session).createAny("education").granted) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

### 5. Form Handling avec React Hook Form + Zod

Validation côté client et serveur avec les mêmes schémas :

```typescript
// Schéma Zod partagé
export const educationSchema = z.object({
  school: z.string().min(1),
  degree: z.string().optional(),
  // ...
});

// Côté serveur (tRPC)
create: protectedProcedure
  .input(educationSchema)
  .mutation(async ({ input }) => {
    // input est validé automatiquement
  });

// Côté client (React Hook Form)
const form = useForm({
  resolver: zodResolver(educationSchema),
});
```

## 🔐 Sécurité

### Authentification
- **NextAuth.js** avec stratégie JWT
- Providers : Credentials (email/password)
- Hachage des mots de passe avec **Argon2**

### Autorisation
- **AccessControl** pour les permissions basées sur les rôles
- Middleware tRPC pour vérifier les permissions
- Procédures protégées vs publiques

### Variables d'environnement
- Validation stricte avec `@t3-oss/env-nextjs`
- Type-safe environment variables
- Séparation client/serveur

## 🚀 Performance

### Optimisations Next.js
- **Server Components** par défaut (pas de JS envoyé au client)
- **Streaming SSR** avec Suspense
- **Image Optimization** automatique
- **Font Optimization** avec next/font

### Optimisations React Query
- Cache automatique des requêtes
- Prefetching intelligent
- Invalidation ciblée du cache

### Optimisations base de données
- Indexation appropriée (Prisma)
- Relations optimisées
- Queries sélectives (select only needed fields)

## 🧪 Philosophie de développement

### Developer Experience (DX)
- **Type-safety** partout
- **Auto-completion** dans l'IDE
- **Hot Module Replacement** rapide
- **Erreurs claires** à la compilation

### Code Quality
- **ESLint** pour les règles de codage
- **Prettier** pour le formatage
- **TypeScript strict mode**
- **Zod** pour la validation runtime

### Maintenability
- **Séparation claire** des responsabilités
- **Code modulaire** et réutilisable
- **Conventions cohérentes**
- **Documentation inline** (JSDoc)

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [T3 Stack Documentation](https://create.t3.gg/)
