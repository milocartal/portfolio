# Portfolio Personnel

Une application de portfolio moderne et complète construite avec la stack T3 (TypeScript, Next.js, tRPC, Prisma), permettant de gérer et présenter de manière professionnelle profils, expériences, formations, compétences et projets.

## ✨ Fonctionnalités

- **📄 Gestion de CV dynamique** : Création et personnalisation de CV avec différents thèmes
- **🔐 Authentification complète** : Système d'authentification avec NextAuth.js et gestion des rôles
- **⚡ Administration en temps réel** : Interface d'administration pour gérer tous les contenus
- **📝 Éditeur riche** : Intégration de Lexical pour l'édition de contenu markdown
- **🎨 Interface moderne** : Design responsive avec Tailwind CSS et composants Radix UI
- **🔍 Contrôle d'accès** : Système de permissions granulaires avec AccessControl
- **📊 Gestion des données** : Base de données PostgreSQL avec Prisma ORM
- **🚀 Performance optimisée** : Stack Next.js 15 avec optimisations avancées

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

- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI accessibles
- **[Lexical](https://lexical.dev/)** - Éditeur de texte riche extensible
- **[Lucide React](https://lucide.dev/)** - Icônes modernes
- **[Sonner](https://sonner.emilkowal.ski/)** - Notifications toast

### Développement

- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatteur de code
- **[pnpm](https://pnpm.io/)** - Gestionnaire de paquets performant

## 🚀 Installation et configuration

### Prérequis

- Node.js 18+
- pnpm
- PostgreSQL
- Docker (optionnel, pour la base de données locale)

### 1. Cloner le projet

```bash
git clone https://github.com/milocartal/portfolio.git
cd portfolio
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/portfolio"

# NextAuth.js
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### 4. Configuration de la base de données

#### Option A : Base de données locale avec Docker

```bash
# Démarrer la base de données avec le script fourni
chmod +x start-database.sh
./start-database.sh
```

#### Option B : Base de données existante

Assurez-vous que PostgreSQL est installé et configuré, puis mettez à jour l'URL de connexion.

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# Optionnel : Peupler avec des données de test
pnpm seed
```

### 6. Lancer l'application

```bash
# Mode développement
pnpm dev

# Mode développement avec Turbo (plus rapide)
pnpm turbo

# Mode production
pnpm build
pnpm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```text
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Interface d'administration
│   ├── api/               # Routes API
│   └── _components/       # Composants réutilisables
│       ├── education/     # Gestion des formations
│       ├── experience/    # Gestion des expériences
│       ├── lexical/       # Éditeur de texte riche
│       ├── profile/       # Gestion du profil
│       ├── skill/         # Gestion des compétences
│       ├── ui/           # Composants UI de base
│       └── user/         # Gestion des utilisateurs
├── lib/                   # Utilitaires et modèles
├── server/               # Configuration serveur
│   ├── api/              # Routeurs tRPC
│   ├── auth/             # Configuration NextAuth
│   └── db.ts             # Client Prisma
├── styles/               # Styles globaux
├── trpc/                 # Configuration client tRPC
└── utils/                # Utilitaires
```

## 🎯 Utilisation

### Interface publique

- Consultation des CV publics
- Visualisation des profils, expériences et projets

### Interface d'administration

Accessible via `/admin` (authentification requise avec rôle admin) :

1. **Gestion du profil** : Informations personnelles, coordonnées
2. **Expériences professionnelles** : Postes, entreprises, périodes
3. **Formations** : Diplômes, écoles, certifications
4. **Compétences** : Technologies, niveaux, catégories
5. **Projets** : Portfolio de réalisations
6. **Utilisateurs** : Gestion des accès et rôles

### Création de CV

- Sélection des éléments à inclure
- Personnalisation de l'ordre des sections
- Choix du thème de présentation
- Export et partage

## 🔑 Système de rôles

- **viewer** : Consultation publique des contenus
- **admin** : Accès complet à l'interface d'administration

## 📜 Scripts disponibles

```bash
# Développement
pnpm dev                 # Démarrer en mode développement
pnpm turbo              # Démarrer avec Turbo (plus rapide)

# Construction et production
pnpm build              # Construire l'application
pnpm start              # Démarrer en mode production
pnpm preview            # Construire et démarrer

# Base de données
pnpm db:generate        # Générer le client Prisma
pnpm db:migrate         # Appliquer les migrations
pnpm db:push            # Pousser le schéma vers la DB
pnpm db:studio          # Ouvrir Prisma Studio
pnpm seed               # Peupler la base de données

# Qualité du code
pnpm lint               # Linter le code
pnpm lint:fix           # Corriger automatiquement
pnpm format:check       # Vérifier le formatage
pnpm format:write       # Formater le code
pnpm typecheck          # Vérification TypeScript
pnpm check              # Lint + vérification types
```

## 🚀 Déploiement

### Vercel (recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Docker

```bash
# Construire l'image
docker build -t portfolio .

# Lancer le conteneur
docker run -p 3000:3000 portfolio
```

### Variables d'environnement de production

```env
DATABASE_URL="your-production-database-url"
AUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## 🤝 Contribution

1. Forker le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

- Ouvrir une [issue](https://github.com/milocartal/portfolio/issues)
- Consulter la [documentation T3 Stack](https://create.t3.gg/)

---

Développé avec ❤️ en utilisant la [T3 Stack](https://create.t3.gg/)
