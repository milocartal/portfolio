# Portfolio Personnel

> Une application de portfolio moderne et complète construite avec la **T3 Stack** (TypeScript, Next.js, tRPC, Prisma), permettant de gérer et présenter de manière professionnelle profils, expériences, formations, compétences et projets.

[![Next.js](https://img.shields.io/badge/Next.js-16-yellow?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be?logo=trpc)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## 📚 Documentation

**[→ Documentation complète dans `/src/app/docs/`](./src/app/docs/README.md)**

- 📖 [Guide de développement](./src/app/docs/development.md) - Installation et workflow
- 🚀 [Guide de déploiement](./src/app/docs/deployment.md) - Production et hébergement
- 🏗️ [Architecture](./src/app/docs/architecture.md) - Structure et patterns
- 🗄️ [Base de données](./src/app/docs/database.md) - Schéma et modèles
- 🔐 [Authentification](./src/app/docs/authentication.md) - NextAuth et permissions
- 🔌 [API tRPC](./src/app/docs/api.md) - Routers et procédures
- 🎨 [Composants UI](./src/app/docs/components.md) - Interface et composants

## ✨ Fonctionnalités

- **📄 Gestion de CV dynamique** - Création et personnalisation de CV avec différents thèmes
- **🔐 Authentification complète** - NextAuth.js avec gestion des rôles et permissions
- **⚡ Administration en temps réel** - Interface d'administration pour gérer tous les contenus
- **📝 Éditeur riche** - Intégration de Lexical pour l'édition de contenu markdown
- **🎨 Interface moderne** - Design responsive avec Tailwind CSS et shadcn/ui
- **🔍 Contrôle d'accès** - Système de permissions granulaires avec AccessControl
- **📊 Gestion des données** - Base de données PostgreSQL avec Prisma ORM
- **🚀 Performance optimisée** - Stack Next.js 15 avec Server Components et optimisations

## 🛠️ Technologies utilisées

### Core Stack

- **[Next.js 15](https://nextjs.org)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique pour JavaScript
- **[tRPC](https://trpc.io)** - API type-safe end-to-end
- **[Prisma](https://prisma.io)** - ORM moderne pour TypeScript

### Base de données

- **[PostgreSQL](https://www.postgresql.org/)** - Base de données relationnelle
- **[Prisma Client](https://www.prisma.io/client)** - Client de base de données type-safe

### Authentification & Autorisation

- **[NextAuth.js](https://next-auth.js.org)** - Authentification pour Next.js
- **[AccessControl](https://github.com/onury/accesscontrol)** - Contrôle d'accès basé sur les rôles
- **[Argon2](https://www.npmjs.com/package/argon2)** - Hachage sécurisé des mots de passe

### UI/UX

- **[Tailwind CSS 4](https://tailwindcss.com)** - Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Composants primitifs accessibles
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI stylisés
- **[Lexical](https://lexical.dev/)** - Éditeur de texte riche extensible
- **[Lucide React](https://lucide.dev/)** - Icônes modernes
- **[Sonner](https://sonner.emilkowal.ski/)** - Notifications toast

### Développement

- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatteur de code
- **[pnpm](https://pnpm.io/)** - Gestionnaire de paquets performant

## 🚀 Démarrage rapide

### Prérequis

Assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **pnpm** 10+ ([installer](https://pnpm.io/installation))
- **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
- **Git** ([télécharger](https://git-scm.com/))

### Installation en 5 minutes

#### 1. Cloner le projet

```bash
git clone https://github.com/milocartal/portfolio.git
cd portfolio
```

#### 2. Installer les dépendances

```bash
pnpm install
```

#### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio"

# NextAuth.js
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"

# Générer AUTH_SECRET
# openssl rand -base64 32
```

#### 4. Configuration de la base de données

**Option A : Base de données locale avec Docker**

./start-database.sh
```

**Option B : Base de données existante**

Assurez-vous que PostgreSQL est installé et configuré, puis mettez à jour `DATABASE_URL` dans `.env`.

#### 5. Initialiser la base de données
Assurez-vous que PostgreSQL est installé et configuré, puis mettez à jour l'URL de connexion.

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
pnpm db:generate

# (Optionnel) Peupler avec des données de test
pnpm seed
```

#### 6. Lancer l'application
```

### 6. Lancer l'application

```bash
# Démarrer le serveur de développement
pnpm dev
```

🎉 **L'application est maintenant accessible sur [http://localhost:3000](http://localhost:3000)**

> **Compte de test** : `admin@example.com` / `admin123` (après `pnpm seed`)

---

📖 **Pour plus de détails** : Consultez le [Guide de développement complet](./src/app/docs/development.md)

## 📁 Structure du projet

```text
portfolio/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── layout.tsx            # Layout racine
│   │   ├── admin/                # Interface d'administration
│   │   ├── api/                  # Routes API (NextAuth, tRPC)
│   │   ├── docs/                 # 📚 Documentation complète
│   │   └── _components/          # Composants réutilisables
│   │       ├── ui/               # Composants UI (shadcn/ui)
│   │       ├── education/        # Gestion des formations
│   │       ├── experience/       # Gestion des expériences
│   │       ├── skill/            # Gestion des compétences
│   │       ├── lexical/          # Éditeur de texte riche
│   │       └── ...
│   ├── server/                   # Code serveur
│   │   ├── api/                  # Routers tRPC
│   │   ├── auth/                 # Configuration NextAuth
│   │   └── db.ts                 # Client Prisma
│   ├── lib/                      # Modèles et utilitaires
│   ├── utils/                    # Helpers métier
│   └── trpc/                     # Configuration client tRPC
```

## 🎯 Fonctionnement

### 🌐 Interface publique

- Consultation des CV publics
- Visualisation des profils, expériences et projets

### 🔐 Interface d'administration

Accessible via `/admin` (authentification requise avec rôle `admin`) :

| Module | Description |
|--------|-------------|
| 👤 **Profil** | Informations personnelles, coordonnées |
| 💼 **Expériences** | Postes, entreprises, périodes |
| 🎓 **Formations** | Diplômes, écoles, certifications |
| 🛠️ **Compétences** | Technologies, niveaux, catégories |
| 🚀 **Projets** | Portfolio de réalisations |
| 👥 **Utilisateurs** | Gestion des accès et rôles |

### 📄 Système de CV (en développement)

- Sélection des éléments à inclure
- Personnalisation de l'ordre des sections
- Choix du thème de présentation
- Export et partage

## 📜 Commandes disponibles

### Développement

```bash
pnpm dev                 # Démarrer le serveur de développement
pnpm turbo              # Démarrer avec Turbo (expérimental, plus rapide)
pnpm build              # Construire pour la production
pnpm start              # Démarrer en mode production
```

### Base de données

```bash
pnpm db:generate        # Générer le client Prisma
pnpm db:push            # Appliquer le schéma à la DB (dev)
pnpm db:migrate         # Créer/appliquer une migration (prod)
pnpm db:studio          # Ouvrir Prisma Studio (interface graphique)
pnpm seed               # Peupler avec des données de test
```

### Qualité du code

```bash
pnpm lint               # Vérifier les erreurs de lint
pnpm lint:fix           # Corriger automatiquement
pnpm format:check       # Vérifier le formatage
pnpm format:write       # Formater le code
```

## 🤝 Contribution

1. Forker le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce dépôt est public **mais n’est pas open source**.  
Sauf accord écrit, **tous droits sont réservés**. Aucune réutilisation,
modification, redistribution ou exploitation commerciale n’est autorisée.

- **But du dépôt** : transparence et démonstration du projet `Portfolio`.
- **Contributions** : ouvrez une *issue* pour les bugs/retours. Les *pull
  requests* externes peuvent être fermées sans examen.
- **Composants tiers** : les dépendances sont couvertes par leurs propres
  licences (voir chaque paquet).

### Ce qui est autorisé

- Lire le code et consulter l’historique des commits.
- Ouvrir des issues pour signaler un problème ou proposer une idée.

### Ce qui est interdit sans accord écrit

- Réutiliser le code dans un autre projet, public ou privé.
- Redistribuer, publier des copies ou proposer des builds.
- Déployer ce code en production ou vendre un service basé dessus.

Pour toute demande de licence ou d’exception : milo.cartal.pro@gmail.com.

Référence : voir le fichier [LICENSE](./LICENSE).

## 🆘 Support

Pour toute question ou problème :

- Ouvrir une [issue](https://github.com/milocartal/portfolio/issues)
- Consulter la [documentation T3 Stack](https://create.t3.gg/)

---

Développé avec ❤️ en utilisant la [T3 Stack](https://create.t3.gg/)
