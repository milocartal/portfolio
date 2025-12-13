# Métadonnées et SEO

## Vue d'ensemble

Le portfolio utilise les métadonnées Next.js 15 pour optimiser le référencement (SEO) et l'apparence sur les réseaux sociaux.

## Configuration principale

### Layout Root (`src/app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Milo Cartal - Portfolio",
    template: "%s | Milo Cartal",
  },
  description: "Portfolio de Milo Cartal - Développeur Full Stack...",
  // ... voir le fichier complet
};
```

### Variables d'environnement

Ajouter dans `.env` :

```bash
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Fichiers générés

### 1. Sitemap (`src/app/sitemap.ts`)

Génère automatiquement un sitemap XML pour les moteurs de recherche :

- Homepage : priorité 1.0, mise à jour hebdomadaire
- Admin : priorité 0.5, mise à jour quotidienne

Accessible à : `https://your-domain.com/sitemap.xml`

### 2. OpenGraph Image (`src/app/opengraph-image.tsx`)

Génère dynamiquement une image 1200×630 pour les partages sociaux avec :
- Nom (Milo Cartal)
- Titre (Développeur Full Stack)
- Technologies (TypeScript, React, Next.js, Node.js)

Accessible à : `https://your-domain.com/opengraph-image`

### 3. Web App Manifest (`public/site.webmanifest`)

Configuration PWA pour l'installation sur mobile :

```json
{
  "name": "Milo Cartal - Portfolio",
  "short_name": "Milo Cartal",
  "display": "standalone",
  "icons": [...]
}
```

### 4. Robots.txt (`public/robots.txt`)

Configure l'indexation par les moteurs de recherche :
- Autorise l'indexation globale
- Bloque `/admin/`
- Référence le sitemap

## Métadonnées OpenGraph

### Facebook / LinkedIn

Les propriétés OpenGraph optimisent l'aperçu sur Facebook, LinkedIn, WhatsApp :

```typescript
openGraph: {
  type: "website",
  locale: "fr_FR",
  url: "...",
  title: "Milo Cartal - Portfolio",
  description: "...",
  images: [{ url: "/og-image.png", width: 1200, height: 630 }],
}
```

### Twitter

Configuration spécifique pour les Twitter Cards :

```typescript
twitter: {
  card: "summary_large_image",
  title: "...",
  description: "...",
  images: ["/og-image.png"],
  creator: "@milocartal",
}
```

## Icônes et favicons

### Fichiers requis dans `/public`

- `favicon.ico` : Icône 32×32 classique
- `icon.svg` : Icône vectorielle (recommandé)
- `apple-touch-icon.png` : Icône iOS 180×180
- `icon-192.png` : PWA icône 192×192
- `icon-512.png` : PWA icône 512×512

### Génération avec Figma / Inkscape

1. Créer un logo carré
2. Exporter en SVG (`icon.svg`)
3. Exporter en PNG aux tailles requises
4. Optimiser avec [Squoosh](https://squoosh.app/) ou ImageOptim

## Mots-clés SEO

Les mots-clés principaux pour le référencement :

```typescript
keywords: [
  "Milo Cartal",
  "Portfolio",
  "Développeur Full Stack",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "tRPC",
  "Prisma",
]
```

## Robots et indexation

### Configuration robots

```typescript
robots: {
  index: true,        // Autoriser l'indexation
  follow: true,       // Suivre les liens
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,      // Pas de limite
    "max-image-preview": "large", // Grandes images
    "max-snippet": -1,            // Pas de limite
  },
}
```

### Pages à exclure

Dans `robots.txt`, bloquer les pages sensibles :

```
User-agent: *
Disallow: /admin/
Disallow: /api/
```

## Métadonnées par page

### Override sur une page spécifique

```typescript
// src/app/admin/page.tsx
export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,  // Ne pas indexer la page admin
    follow: false,
  },
};
```

### Métadonnées dynamiques

Pour les pages dynamiques (ex: projets individuels) :

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await api.project.getById(params.id);
  
  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: project.name,
      images: [project.imageUrl],
    },
  };
}
```

## Vérification SEO

### Outils de test

1. **Google Search Console** : Tester l'indexation
2. **Facebook Debugger** : https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator** : https://cards-dev.twitter.com/validator
4. **LinkedIn Post Inspector** : https://www.linkedin.com/post-inspector/

### Checklist avant déploiement

- [ ] Variable `NEXT_PUBLIC_APP_URL` configurée en production
- [ ] Toutes les icônes présentes dans `/public`
- [ ] Image OpenGraph générée correctement
- [ ] Sitemap accessible
- [ ] Robots.txt configuré
- [ ] Métadonnées testées sur Facebook/Twitter
- [ ] Google Search Console vérifié

## Performance

### Optimisations automatiques

Next.js optimise automatiquement :
- Génération statique du sitemap
- Cache des images OpenGraph (edge runtime)
- Compression des métadonnées

### Lighthouse Score

Viser :
- **Performance** : 90+
- **Accessibility** : 95+
- **Best Practices** : 95+
- **SEO** : 100

## Ressources

- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Schema.org](https://schema.org/)
