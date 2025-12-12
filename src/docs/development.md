# Guide de développement

## 🚀 Démarrage rapide

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **pnpm** 10+ (gestionnaire de paquets)
- **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
- **Git** ([télécharger](https://git-scm.com/))
- **VS Code** recommandé avec extensions :
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Installation de pnpm

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via Corepack (recommandé)
corepack enable
corepack prepare pnpm@latest --activate
```

### Setup du projet

```bash
# 1. Cloner le repository
git clone https://github.com/milocartal/portfolio.git
cd portfolio

# 2. Installer les dépendances
pnpm install

# 3. Copier les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Démarrer PostgreSQL (si local)
# Option A : Via Docker
chmod +x start-database.sh
./start-database.sh

# Option B : PostgreSQL déjà installé
# Créer une base de données
createdb portfolio

# 5. Configurer la base de données
pnpm db:push

# 6. (Optionnel) Peupler avec des données de test
pnpm seed

# 7. Démarrer le serveur de développement
pnpm dev
```

L'application est maintenant accessible sur [http://localhost:3000](http://localhost:3000)

## 📋 Scripts disponibles

### Développement

```bash
# Démarrer en mode développement
pnpm dev

# Démarrer avec Turbo (plus rapide, expérimental)
pnpm turbo
```

### Build & Production

```bash
# Construire l'application
pnpm build

# Démarrer en mode production
pnpm start

# Build + Start combinés
pnpm preview
```

### Base de données

```bash
# Générer le client Prisma (après modification du schema)
pnpm db:generate

# Appliquer le schéma à la DB (dev)
pnpm db:push

# Créer une migration (production)
pnpm db:migrate

# Ouvrir Prisma Studio (GUI pour la DB)
pnpm db:studio

# Peupler la base de données
pnpm seed
```

### Qualité du code

```bash
# Linter le code
pnpm lint

# Corriger automatiquement les erreurs de lint
pnpm lint:fix

# Vérifier le formatage du code
pnpm format:check

# Formater le code automatiquement
pnpm format:write

# Vérifier les types TypeScript
pnpm typecheck

# Lint + TypeCheck combinés
pnpm check
```

## 🗄️ Configuration de la base de données

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio"

# NextAuth.js
AUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### Base de données locale avec Docker

Le script `start-database.sh` configure automatiquement PostgreSQL :

```bash
#!/bin/bash
docker run -d \
  --name portfolio-postgres \
  -e POSTGRES_USER=portfolio \
  -e POSTGRES_PASSWORD=portfolio \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 \
  postgres:16-alpine
```

Puis dans `.env` :
```env
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio"
```

### Migrations Prisma

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations
npx prisma migrate deploy

# Réinitialiser la DB (⚠️ supprime toutes les données)
npx prisma migrate reset
```

## 🏗️ Structure du workflow de développement

### 1. Créer une nouvelle feature

```bash
# Créer une branche
git checkout -b feature/ma-nouvelle-fonctionnalite

# Développer
# ... coder ...

# Commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Pousser
git push origin feature/ma-nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
```

### 2. Ajouter une nouvelle entité

Exemple : Ajouter une entité "Certificate"

#### a. Définir le modèle Prisma

```prisma
// prisma/schema.prisma
model Certificate {
  id String @id @default(cuid())

  name        String
  issuer      String
  issuedDate  DateTime?
  expiryDate  DateTime?
  credentialUrl String?
  
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### b. Créer la migration

```bash
pnpm db:generate
pnpm db:push
```

#### c. Créer le schéma Zod

```typescript
// src/lib/models/Certificate.ts
import { z } from "zod";

export const certificateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  issuer: z.string().min(1, "L'émetteur est requis"),
  issuedDate: z.date().optional(),
  expiryDate: z.date().optional(),
  credentialUrl: z.string().url().optional(),
  orderIndex: z.number().optional(),
});

export type Certificate = z.infer<typeof certificateSchema>;
```

#### d. Créer le router tRPC

```typescript
// src/server/api/routers/certificate.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { certificateSchema } from "~/lib/models/Certificate";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { can } from "~/utils/accesscontrol";

export const certificateRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.certificate.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.certificate.findUnique({
        where: { id: input.id },
      });
    }),

  create: protectedProcedure
    .input(certificateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).createAny("certificate").granted) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.certificate.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(certificateSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).updateAny("certificate").granted) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;
      return db.certificate.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.session).deleteAny("certificate").granted) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.certificate.delete({
        where: { id: input.id },
      });
    }),
});
```

#### e. Ajouter au router principal

```typescript
// src/server/api/root.ts
import { certificateRouter } from "~/server/api/routers/certificate";

export const appRouter = createTRPCRouter({
  // ... autres routers
  certificate: certificateRouter,
});
```

#### f. Créer les composants UI

```tsx
// src/app/_components/certificate/create.tsx
// src/app/_components/certificate/update.tsx
// src/app/_components/certificate/datatable.tsx
// Suivre le pattern des autres entités (education, experience)
```

#### g. Créer les pages admin

```tsx
// src/app/admin/certificates/page.tsx
// src/app/admin/certificates/new/page.tsx
// src/app/admin/certificates/[slug]/page.tsx
```

## 🎨 Conventions de code

### Structure des fichiers

```
feature/
├── index.tsx          # Exports publics
├── type.ts            # Types TypeScript
├── create.tsx         # Formulaire de création
├── update.tsx         # Formulaire d'édition
├── datatable.tsx      # Table de données
└── [component].tsx    # Autres composants
```

### Conventions de nommage

```typescript
// Composants : PascalCase
export function EducationCard() {}

// Fonctions : camelCase
export function formatDate() {}

// Types/Interfaces : PascalCase
export interface Education {}
export type EducationInput = {};

// Constantes : UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Fichiers : kebab-case
// my-component.tsx, use-custom-hook.ts
```

### Organisation des imports

```typescript
// 1. Imports externes
import { useState } from "react";
import { useForm } from "react-hook-form";

// 2. Imports internes (aliases)
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";

// 3. Imports relatifs
import { EducationCard } from "./education-card";

// 4. Types
import type { Education } from "~/lib/models/Education";
```

### Commentaires

```typescript
/**
 * Crée une nouvelle formation dans la base de données.
 * 
 * @param data - Les données de la formation
 * @returns La formation créée
 * @throws {TRPCError} Si l'utilisateur n'a pas les permissions
 */
export async function createEducation(data: EducationInput) {
  // ...
}
```

## 🧪 Tests (à implémenter)

### Structure recommandée

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── utils.test.ts
│   │   └── models.test.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── auth.test.ts
│   └── e2e/
│       ├── admin.test.ts
│       └── public.test.ts
```

### Outils recommandés

```bash
# Installer les dépendances de test
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# Installer Playwright pour E2E
pnpm add -D @playwright/test
```

## 🔍 Debugging

### VS Code Launch Configuration

Créer `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Console logs

```typescript
// Serveur (Node.js)
console.log("Server:", data);

// Client (Browser)
console.log("Client:", data);

// tRPC procedures
console.log("[TRPC]", "education.create", input);
```

### React DevTools

- Installer l'extension Chrome/Firefox
- Inspecter les composants
- Voir les props, state, hooks

### Prisma Studio

```bash
pnpm db:studio
```

Interface web pour visualiser et modifier les données de la DB.

## 🚨 Résolution de problèmes

### Problèmes courants

#### Erreur "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules .next
pnpm install
```

#### Erreur Prisma Client

```bash
# Régénérer le client Prisma
pnpm db:generate
```

#### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 pnpm dev
```

#### Base de données inaccessible

```bash
# Vérifier que PostgreSQL est démarré
pg_isready

# Vérifier la connexion
psql $DATABASE_URL

# Redémarrer le conteneur Docker
docker restart portfolio-postgres
```

## 📝 Bonnes pratiques

### 1. Commits Git

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
feat: ajouter page de profil
fix: corriger bug de validation
docs: mettre à jour le README
style: formater le code
refactor: restructurer les composants
test: ajouter tests unitaires
chore: mettre à jour les dépendances
```

### 2. Type-safety

```typescript
// ❌ Mauvais : any
function processData(data: any) {}

// ✅ Bon : Types explicites
function processData(data: Education) {}

// ✅ Bon : Inférence de types
const education = await api.education.getById({ id: "123" });
// education est typé automatiquement!
```

### 3. Error Handling

```typescript
// ✅ Bon : Gestion des erreurs
const { data, error, isLoading } = api.education.getAll.useQuery();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <EducationList data={data} />;
```

### 4. Performance

```typescript
// ✅ Utiliser les Server Components par défaut
export default async function Page() {
  const data = await api.education.getAll();
  return <List data={data} />;
}

// ✅ Client Components seulement quand nécessaire
"use client";
export function InteractiveList() {
  const [selected, setSelected] = useState();
  // ...
}
```

### 5. Sécurité

```typescript
// ✅ Toujours valider les inputs
create: protectedProcedure
  .input(educationSchema) // Validation avec Zod
  .mutation(async ({ input }) => {
    // input est validé ✅
  });

// ✅ Vérifier les permissions
if (!can(ctx.session).createAny("education").granted) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

## 📚 Ressources utiles

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/)

### Communauté

- [T3 Stack Discord](https://t3.gg/discord)
- [Next.js Discord](https://discord.com/invite/bUG2bvbtHy)
- [Prisma Slack](https://slack.prisma.io/)

### Outils

- [Excalidraw](https://excalidraw.com/) - Diagrammes
- [dbdiagram.io](https://dbdiagram.io/) - Schémas de base de données
- [TypeScript Playground](https://www.typescriptlang.org/play)

## 🎓 Formation continue

### Tutoriels recommandés

1. **T3 Stack**
   - [Create T3 App Tutorial](https://create.t3.gg/)
   - [T3 Stack from Scratch](https://www.youtube.com/watch?v=YkOSUVzOAA4)

2. **Next.js 15**
   - [Next.js App Router](https://nextjs.org/docs/app)
   - [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

3. **tRPC**
   - [tRPC Quickstart](https://trpc.io/docs/quickstart)
   - [tRPC with Next.js](https://trpc.io/docs/client/nextjs)

4. **Prisma**
   - [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
   - [Prisma with Next.js](https://www.prisma.io/nextjs)

## 🤝 Contribution

### Guidelines

1. **Fork** le repository
2. **Créer** une branche pour votre feature
3. **Coder** en suivant les conventions
4. **Tester** vos changements
5. **Commiter** avec des messages clairs
6. **Pousser** votre branche
7. **Créer** une Pull Request

### Template de Pull Request

```markdown
## Description
[Décrivez vos changements]

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Le code suit les conventions du projet
- [ ] J'ai testé mes changements
- [ ] J'ai mis à jour la documentation
- [ ] Les types TypeScript sont corrects
- [ ] Le code passe les checks (lint, typecheck)
```

## 📋 Checklist du développeur

Avant chaque commit :

- [ ] Code formaté (`pnpm format:write`)
- [ ] Pas d'erreurs de lint (`pnpm lint`)
- [ ] Types corrects (`pnpm typecheck`)
- [ ] Testé localement (`pnpm dev`)
- [ ] Pas de console.log inutiles
- [ ] Commentaires utiles ajoutés
- [ ] Documentation mise à jour si nécessaire

Avant chaque Pull Request :

- [ ] Build réussit (`pnpm build`)
- [ ] Tous les checks passent (`pnpm check`)
- [ ] Migrations Prisma créées si nécessaire
- [ ] Screenshots/vidéos ajoutés si pertinent
- [ ] Description claire de la PR
- [ ] Tests ajoutés/mis à jour

---

Bon développement ! 🚀
