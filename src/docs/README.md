# Documentation Portfolio

Bienvenue dans la documentation complète de l'application Portfolio. Cette documentation couvre tous les aspects du projet, de l'architecture aux détails d'implémentation.

## 📚 Table des matières

### Pour commencer

- **[Guide de développement](./development.md)** - Installation, configuration et workflow de développement
- **[Guide de déploiement](./deployment.md)** - Déploiement en production (Vercel, Docker, etc.)

### Architecture & Concepts

- **[Architecture](./architecture.md)** - Structure globale, patterns et philosophie du projet
- **[Base de données](./database.md)** - Schéma Prisma, modèles et relations
- **[Authentification](./authentication.md)** - NextAuth.js, rôles et permissions
- **[API tRPC](./api.md)** - Routers, procédures et utilisation côté client
- **[Composants UI](./components.md)** - Composants réutilisables et patterns d'interface

## 🚀 Démarrage rapide

### Installation en 5 minutes

```bash
# 1. Cloner et installer
git clone https://github.com/milocartal/portfolio.git
cd portfolio
pnpm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer la base de données
./start-database.sh

# 4. Configurer Prisma
pnpm db:push
pnpm seed

# 5. Lancer l'application
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Stack technique

Cette application est construite avec la **T3 Stack** :

| Technologie | Description |
|------------|-------------|
| [Next.js 15](https://nextjs.org) | Framework React avec App Router |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [tRPC](https://trpc.io) | API type-safe end-to-end |
| [Prisma](https://prisma.io) | ORM pour PostgreSQL |
| [NextAuth.js](https://next-auth.js.org) | Authentification |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Radix UI](https://www.radix-ui.com/) | Composants primitifs |
| [Lexical](https://lexical.dev/) | Éditeur de texte riche |

## 📖 Guide par cas d'usage

### Je veux...

#### Comprendre le projet
→ Commencer par [Architecture](./architecture.md)

#### Installer et développer localement
→ Suivre le [Guide de développement](./development.md)

#### Ajouter une nouvelle fonctionnalité
1. Lire [Architecture](./architecture.md) pour comprendre les patterns
2. Consulter [Base de données](./database.md) pour modifier le schéma
3. Voir [API tRPC](./api.md) pour créer les endpoints
4. Utiliser [Composants UI](./components.md) pour l'interface

#### Gérer l'authentification
→ Consulter [Authentification](./authentication.md)

#### Déployer en production
→ Suivre le [Guide de déploiement](./deployment.md)

#### Créer une nouvelle page admin
```typescript
// src/app/admin/ma-page/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function MaPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }
  
  return <div>Contenu admin</div>;
}
```

#### Ajouter un nouveau composant UI
→ Voir [Composants UI - Ajouter un nouveau composant](./components.md#-ajouter-un-nouveau-composant-ui)

## 🎯 Concepts clés

### Type-Safety partout

L'application garantit la sécurité de type de bout en bout :

```typescript
// Définir une fois
export const educationSchema = z.object({
  school: z.string(),
  degree: z.string().optional(),
});

// Utiliser partout avec typage automatique
// - API tRPC
// - Formulaires React
// - Base de données via Prisma
// - Composants React
```

### Server Components par défaut

Next.js 15 utilise les Server Components :

- **Server Components** : Rendu côté serveur, accès direct DB
- **Client Components** : Marqués `"use client"`, pour l'interactivité

### Architecture en couches

```
UI Components → tRPC Client → tRPC Router → Business Logic → Prisma → PostgreSQL
```

Chaque couche a une responsabilité claire et communique via des interfaces type-safe.

## 📝 Structure du projet

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Page d'accueil
│   ├── admin/        # Interface d'administration
│   └── _components/  # Composants réutilisables
├── server/           # Code serveur
│   ├── api/          # Routers tRPC
│   ├── auth/         # Configuration NextAuth
│   └── db.ts         # Client Prisma
├── lib/              # Utilitaires et modèles
├── utils/            # Helpers métier
└── trpc/             # Configuration client tRPC
```

## 🔒 Sécurité

L'application implémente :

- **Authentification** : NextAuth.js avec Argon2
- **Autorisation** : AccessControl pour les permissions basées sur les rôles
- **Validation** : Zod pour valider tous les inputs
- **Protection CSRF** : Automatique avec NextAuth.js
- **Sessions sécurisées** : JWT avec cookies httpOnly

## 📊 Modèles de données

Principales entités :

- **User** : Utilisateurs avec rôles (viewer, admin)
- **Profile** : Profil personnel (singleton)
- **Education** : Formations et diplômes
- **Experience** : Expériences professionnelles
- **Skill** : Compétences techniques
- **Project** : Portfolio de projets
- **CvVersion** : Versions personnalisables de CV

→ Détails complets dans [Base de données](./database.md)

## 🎨 Composants UI disponibles

Plus de 30 composants UI prêts à l'emploi :

- Formulaires : Input, Select, Textarea, Checkbox, Calendar
- Navigation : Dialog, Dropdown, Sheet, Tabs
- Feedback : Alert, Toast, Skeleton
- Data Display : Table, Card, Avatar, Badge
- Éditeur : Lexical (markdown riche)

→ Documentation complète dans [Composants UI](./components.md)

## 🔧 Commandes essentielles

```bash
# Développement
pnpm dev              # Démarrer le serveur
pnpm build            # Build production
pnpm lint             # Linter le code
pnpm typecheck        # Vérifier les types

# Base de données
pnpm db:push          # Appliquer le schéma
pnpm db:studio        # Ouvrir Prisma Studio
pnpm seed             # Peupler avec des données de test

# Qualité
pnpm format:write     # Formater le code
pnpm check            # Lint + typecheck
```

## 🐛 Résolution de problèmes

### Problèmes fréquents

**Erreur "Module not found"**
```bash
rm -rf node_modules .next && pnpm install
```

**Erreur Prisma Client**
```bash
pnpm db:generate
```

**Port 3000 occupé**
```bash
lsof -i :3000
kill -9 <PID>
```

→ Plus de solutions dans [Guide de développement](./development.md#-résolution-de-problèmes)

## 🤝 Contribution

Les contributions sont bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-feature`)
3. Commiter vos changements (`git commit -m 'feat: ajouter ma feature'`)
4. Pousser vers la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

→ Guidelines complètes dans [Guide de développement](./development.md#-contribution)

## 📚 Ressources externes

### Documentation officielle
- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Communautés
- [T3 Stack Discord](https://t3.gg/discord)
- [Next.js Discord](https://discord.com/invite/bUG2bvbtHy)
- [Prisma Slack](https://slack.prisma.io/)

## 📄 Licence

Ce projet est sous licence MIT.

---

**Besoin d'aide ?** Ouvrir une [issue sur GitHub](https://github.com/milocartal/portfolio/issues) 🙋
