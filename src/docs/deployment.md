# Guide de déploiement

## 🚀 Vue d'ensemble

Ce guide couvre le déploiement de l'application portfolio en production. L'application peut être déployée sur plusieurs plateformes, avec **Vercel** comme option recommandée pour sa simplicité et son intégration native avec Next.js.

## 🎯 Options de déploiement

### 1. Vercel (Recommandé)
- Déploiement automatique depuis Git
- Optimisé pour Next.js
- CDN global
- Preview deployments
- Serverless functions

### 2. Docker
- Containerisation complète
- Déployable sur n'importe quel serveur
- Contrôle total

### 3. Autres plateformes
- Railway
- Render
- AWS (ECS, Amplify)
- Google Cloud Run
- Azure App Service

## 🔐 Variables d'environnement

### Variables requises

Créez un fichier `.env` ou configurez les variables dans votre plateforme de déploiement :

```env
# Base de données (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth.js
AUTH_SECRET="votre-secret-tres-long-et-aleatoire"
NEXTAUTH_URL="https://votre-domaine.com"

# Environnement
NODE_ENV="production"
```

### Générer AUTH_SECRET

```bash
# Générer un secret aléatoire sécurisé
openssl rand -base64 32
```

### Configuration des variables

#### Sur Vercel
1. Aller dans Project Settings → Environment Variables
2. Ajouter chaque variable
3. Sélectionner l'environnement (Production, Preview, Development)

#### Sur Docker
Créer un fichier `.env.production` :
```env
DATABASE_URL="..."
AUTH_SECRET="..."
NEXTAUTH_URL="..."
NODE_ENV="production"
```

## 📦 Déploiement sur Vercel

### Via interface web

1. **Connecter le repository**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer sur "New Project"
   - Importer votre repository GitHub

2. **Configurer le projet**
   - Framework Preset : **Next.js**
   - Root Directory : `./` (ou votre dossier)
   - Build Command : `pnpm build`
   - Output Directory : `.next`
   - Install Command : `pnpm install`

3. **Ajouter les variables d'environnement**
   - Dans la configuration, ajouter toutes les variables requises
   - Vérifier DATABASE_URL, AUTH_SECRET, etc.

4. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre la fin du build
   - Votre site est en ligne !

### Via CLI Vercel

```bash
# Installer Vercel CLI
pnpm add -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Configuration automatique

Créer `vercel.json` (optionnel) :

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "AUTH_SECRET": "@auth_secret"
  }
}
```

## 🐳 Déploiement avec Docker

### Créer un Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dépendances
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Générer Prisma client
RUN pnpm prisma generate

# Build Next.js
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Créer .dockerignore

```
node_modules
.next
.git
.env
.env.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
```

### Configurer Next.js pour Docker

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Important pour Docker
  // ... autres configs
};

module.exports = nextConfig;
```

### Build et run Docker

```bash
# Build l'image
docker build -t portfolio .

# Run le conteneur
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://..." \
  portfolio

# Ou avec docker-compose
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=portfolio
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=portfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Lancer avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🗄️ Base de données en production

### Options de base de données

#### 1. Vercel Postgres
- Intégration native avec Vercel
- Serverless PostgreSQL
- Facile à configurer

```bash
# Installer via Vercel
vercel postgres create
```

#### 2. Supabase
- PostgreSQL managé
- Interface d'administration
- Gratuit jusqu'à 500 MB

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

#### 3. Railway
- PostgreSQL, MySQL, Redis, etc.
- Simple à utiliser
- Free tier disponible

#### 4. Neon
- Serverless PostgreSQL
- Branching pour les environnements
- Auto-scaling

#### 5. AWS RDS
- Production-grade
- Backups automatiques
- Multi-AZ disponible

### Migrations en production

```bash
# Appliquer les migrations
npx prisma migrate deploy

# Ou avec pnpm
pnpm db:migrate
```

**Important :** 
- Ne jamais utiliser `prisma db push` en production
- Toujours utiliser `prisma migrate deploy`
- Tester les migrations sur un environnement de staging

### Backup de la base de données

```bash
# Backup PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Avec Docker
docker exec -t postgres pg_dump -U user database > backup.sql
```

## 🔒 Sécurité en production

### Checklist de sécurité

- [ ] **HTTPS activé** (Vercel le fait automatiquement)
- [ ] **AUTH_SECRET** sécurisé (32+ caractères aléatoires)
- [ ] **Variables d'environnement** sécurisées (pas dans le code)
- [ ] **CORS** configuré correctement
- [ ] **Rate limiting** pour les API
- [ ] **Validation des inputs** côté serveur
- [ ] **Mots de passe hachés** (Argon2)
- [ ] **Session cookies** sécurisés (httpOnly, secure, sameSite)
- [ ] **Headers de sécurité** configurés

### Configuration des headers de sécurité

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 📊 Monitoring et logs

### Vercel Analytics

```bash
# Installer Vercel Analytics
pnpm add @vercel/analytics

# Dans app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)

```bash
# Installer Sentry
pnpm add @sentry/nextjs

# Initialiser
npx @sentry/wizard@latest -i nextjs
```

### Logs

Sur Vercel, les logs sont disponibles dans :
- Deployments → [Votre déploiement] → Functions

Pour Docker :
```bash
# Voir les logs
docker logs -f portfolio

# Avec docker-compose
docker-compose logs -f app
```

## 🎯 Optimisations de production

### 1. Optimisation des images

Next.js optimise automatiquement les images avec `next/image` :

```tsx
import Image from 'next/image';

<Image 
  src="/photo.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // Pour les images above-the-fold
/>
```

### 2. Caching

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
};
```

### 3. Bundle Analyzer

```bash
# Installer
pnpm add -D @next/bundle-analyzer

# Dans next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Analyser
ANALYZE=true pnpm build
```

## 🔄 CI/CD

### GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Environnements multiples

### Staging/Preview

Sur Vercel, chaque Pull Request crée automatiquement un environnement de preview.

### Variables par environnement

```env
# .env.production
DATABASE_URL="postgresql://prod..."
NEXTAUTH_URL="https://portfolio.com"

# .env.staging
DATABASE_URL="postgresql://staging..."
NEXTAUTH_URL="https://staging.portfolio.com"

# .env.development
DATABASE_URL="postgresql://localhost..."
NEXTAUTH_URL="http://localhost:3000"
```

## 🔧 Troubleshooting

### Problèmes courants

#### Build échoue sur Vercel

```bash
# Vérifier les logs de build
# Souvent : problèmes de types TypeScript
pnpm typecheck

# Ou problèmes de linting
pnpm lint
```

#### Base de données inaccessible

- Vérifier que l'IP de Vercel est autorisée
- Vérifier la connection string
- Tester avec `prisma db pull`

#### Variables d'environnement non chargées

- Vérifier qu'elles sont dans l'environnement correct (Production/Preview)
- Redéployer après avoir ajouté des variables
- Pour les variables côté client, préfixer avec `NEXT_PUBLIC_`

## 📚 Checklist de déploiement

Avant de déployer en production :

- [ ] Tester localement en mode production (`pnpm build && pnpm start`)
- [ ] Configurer toutes les variables d'environnement
- [ ] Configurer la base de données de production
- [ ] Appliquer les migrations (`prisma migrate deploy`)
- [ ] Vérifier les permissions et rôles utilisateurs
- [ ] Configurer le domaine personnalisé
- [ ] Activer HTTPS
- [ ] Configurer les headers de sécurité
- [ ] Tester l'authentification
- [ ] Vérifier les performances (Lighthouse)
- [ ] Configurer le monitoring/analytics
- [ ] Mettre en place les backups de la base de données
- [ ] Documenter le processus de déploiement

## 📚 Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
