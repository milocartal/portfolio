# Pages Projets

Ce dossier contient les pages publiques pour afficher les projets du portfolio.

## Structure

```
projects/
├── page.tsx              # Liste de tous les projets (/projects)
├── [id]/
│   ├── page.tsx         # Page de détail d'un projet (/projects/:id)
│   └── not-found.tsx    # Page 404 personnalisée
```

## Pages

### Liste des projets (`/projects`)

Page qui affiche tous les projets sous forme de grille avec :
- Nom du projet
- Aperçu de la description (150 caractères)
- Badges des compétences utilisées (max 5 visibles + compteur)
- Boutons d'action :
  - "Voir plus" → page de détail
  - Icône lien externe → site web du projet
  - Icône GitHub → repository

**Métadonnées SEO :**
- Titre : "Projets"
- Description générique
- OpenGraph pour partage social

### Détail d'un projet (`/projects/[id]`)

Page complète d'un projet individuel avec :

**Header :**
- Titre du projet
- Date de création
- Date de mise à jour
- Boutons "Voir le projet" et "Code source"

**Contenu principal :**
- Description complète avec éditeur Lexical (Markdown)

**Sidebar :**
- Technologies utilisées (badges des compétences)
- Informations (dates, liens)

**Métadonnées dynamiques :**
- Titre basé sur `project.name`
- Description extraite de `project.summaryMd`
- OpenGraph avec type "article"
- Dates de publication/modification
- JSON-LD Schema.org (SoftwareSourceCode)

## Utilisation dans l'application

### Page d'accueil

La page d'accueil (`/`) affiche un aperçu des projets :
- Affiche les 4 premiers projets
- Bouton "Voir tous les projets" → `/projects`
- Chaque carte a un bouton "Voir plus" → `/projects/[id]`

### Navigation

```tsx
// Lien vers la liste
<Link href="/projects">Voir tous les projets</Link>

// Lien vers un projet
<Link href={`/projects/${project.id}`}>Voir le projet</Link>
```

## Types TypeScript

### ProjectWithSkills

Type personnalisé qui inclut les compétences associées :

```typescript
import type { ProjectWithSkills } from "~/lib/models/Project";

// Utilisation
const project: ProjectWithSkills = await api.project.getById({ id });
project.Skills.map(skill => skill.name); // ✅ Typé
```

## API tRPC

Les routes projet incluent automatiquement les Skills :

```typescript
// server/api/routers/project.ts
getAll: publicProcedure.query(async () => {
  return db.project.findMany({
    orderBy: { orderIndex: "asc" },
    include: { Skills: true }, // ← Inclut les compétences
  });
});

getById: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    return db.project.findUnique({
      where: { id: input.id },
      include: { Skills: true }, // ← Inclut les compétences
    });
  });
```

## SEO et Structured Data

### Sitemap

Les projets sont automatiquement inclus dans le sitemap :

```xml
<!-- /sitemap.xml -->
<url>
  <loc>https://example.com/projects</loc>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://example.com/projects/abc123</loc>
  <lastmod>2025-12-13</lastmod>
  <priority>0.7</priority>
</url>
```

### JSON-LD Schema.org

Chaque page de projet génère un schema `SoftwareSourceCode` :

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Mon Projet",
  "description": "Description du projet...",
  "codeRepository": "https://github.com/user/repo",
  "url": "https://project-demo.com",
  "dateCreated": "2024-01-15",
  "dateModified": "2025-12-13"
}
```

## Personnalisation

### Modifier le nombre de projets sur la page d'accueil

Dans `/src/app/page.tsx` :

```tsx
{projects.slice(0, 4).map((project) => (
  // Changer 4 par le nombre souhaité
))}
```

### Modifier le nombre de badges visibles

Dans `/src/app/projects/page.tsx` :

```tsx
{projectSkills.slice(0, 5).map((skill) => (
  // Changer 5 par le nombre souhaité
))}
```

### Ajouter des informations supplémentaires

Modifier le schéma Prisma `Project` et mettre à jour les pages :

1. Ajouter le champ dans `prisma/schema.prisma`
2. Faire `pnpm db:push`
3. Mettre à jour le formulaire dans `/src/app/admin/projects/new`
4. Afficher le champ dans `/src/app/projects/[id]/page.tsx`

## Gestion des erreurs

### Projet inexistant

La fonction `notFound()` de Next.js est appelée automatiquement :

```tsx
if (!project) {
  notFound(); // → Affiche /projects/[id]/not-found.tsx
}
```

La page 404 personnalisée propose :
- Message d'erreur clair
- Bouton "Voir tous les projets"
- Bouton "Retour à l'accueil"

## Performance

### Optimisations Next.js

- **Static Generation** : Les pages sont générées à la build
- **Revalidation** : Utiliser ISR pour mettre à jour périodiquement
- **Image Optimization** : Utiliser `next/image` si vous ajoutez des images
- **Code Splitting** : Composants chargés uniquement si nécessaires

### Exemple avec ISR

```tsx
// Revalider toutes les heures
export const revalidate = 3600;

export default async function ProjectsPage() {
  // ...
}
```

## Tests

### Test de la page liste

```bash
# Vérifier que la page se charge
curl http://localhost:3000/projects

# Vérifier le sitemap
curl http://localhost:3000/sitemap.xml | grep projects
```

### Test de la page détail

```bash
# Récupérer un ID de projet depuis l'admin
# Puis tester l'URL
curl http://localhost:3000/projects/[ID]
```

## Troubleshooting

### Les compétences ne s'affichent pas

Vérifier que les relations sont correctes dans Prisma :

```bash
# Voir les logs SQL
pnpm db:studio

# Vérifier la table Project et Skills
# Vérifier la table de jointure _AquiredInProject
```

### Erreur TypeScript sur project.Skills

S'assurer d'importer le bon type :

```tsx
import type { ProjectWithSkills } from "~/lib/models/Project";

const project = await api.project.getById({ id }) as ProjectWithSkills | null;
```

### Page 404 ne s'affiche pas

Vérifier que le fichier `not-found.tsx` est au bon endroit :
```
projects/[id]/not-found.tsx  ✅
projects/not-found.tsx       ❌
```
