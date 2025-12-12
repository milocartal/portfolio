# Composants UI

## 🎨 Vue d'ensemble

L'application utilise une architecture de composants modulaires basée sur :
- **Radix UI** pour les composants primitifs accessibles
- **shadcn/ui** pour les composants stylisés
- **Tailwind CSS** pour le styling
- **Lexical** pour l'édition de texte riche

## 📁 Structure des composants

```
src/app/_components/
├── ui/                    # Composants UI primitifs (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── select.tsx
│   └── ... (30+ composants)
│
├── navbar/               # Navigation
│   ├── index.tsx         # Barre de navigation
│   └── navbar-footer.tsx # Pied de page navigation
│
├── lexical/             # Éditeur de texte riche
│   ├── LexicalEditor.tsx # Éditeur principal
│   ├── Toolbar.tsx       # Barre d'outils
│   └── display.tsx       # Affichage du contenu
│
├── profile/             # Gestion du profil
│   ├── index.tsx         # Exports
│   ├── upsert.tsx        # Formulaire création/édition
│   └── type.ts           # Types TypeScript
│
├── education/           # Gestion des formations
│   ├── index.tsx         # Exports
│   ├── create.tsx        # Formulaire création
│   ├── update.tsx        # Formulaire édition
│   ├── datatable.tsx     # Table de données
│   └── type.ts           # Types
│
├── experience/          # Gestion des expériences
│   ├── index.tsx
│   ├── create.tsx
│   ├── update.tsx
│   ├── datatable.tsx
│   └── type.ts
│
├── skill/              # Gestion des compétences
│   ├── index.tsx
│   ├── create.tsx
│   ├── update.tsx
│   ├── datatable.tsx
│   └── type.ts
│
├── user/               # Gestion des utilisateurs
│   ├── index.tsx
│   ├── create.tsx
│   ├── update.tsx
│   ├── datatable.tsx
│   └── type.ts
│
├── connection-button.tsx  # Bouton connexion/déconnexion
├── data-table.tsx         # Table de données générique
└── test.tsx              # Composant de test
```

## 🧩 Composants UI primitifs (shadcn/ui)

### Button

Composant de bouton avec variants et tailles.

```tsx
import { Button } from "~/app/_components/ui/button";

// Variants
<Button variant="default">Primary</Button>
<Button variant="destructive">Danger</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button asChild><Link href="/">Link</Link></Button>
```

**Props principales :**
- `variant` : Style du bouton
- `size` : Taille du bouton
- `asChild` : Rendre en tant qu'enfant (pour Link, etc.)
- `disabled` : État désactivé

### Input

Champ de saisie texte stylisé.

```tsx
import { Input } from "~/app/_components/ui/input";

<Input 
  type="text" 
  placeholder="Entrez votre nom"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Types supportés
<Input type="email" />
<Input type="password" />
<Input type="number" />
<Input type="date" />
```

### Form

Composants pour les formulaires avec React Hook Form et Zod.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Fieldset,
  RequiredAsterisk,
} from "~/app/_components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Fieldset>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nom
                  <RequiredAsterisk />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Fieldset>
        <Button type="submit">Soumettre</Button>
      </form>
    </Form>
  );
}
```

### Dialog

Modal/Dialog pour afficher du contenu par-dessus la page.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre du dialog</DialogTitle>
    </DialogHeader>
    <p>Contenu du dialog</p>
  </DialogContent>
</Dialog>
```

### Table

Composants pour créer des tables de données.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Select

Menu déroulant de sélection.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";

<Select onValueChange={setValue} value={value}>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionnez..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Calendar

Sélecteur de date.

```tsx
import { Calendar } from "~/app/_components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/app/_components/ui/popover";
import { format } from "date-fns";

const [date, setDate] = useState<Date>();

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, "PPP") : "Sélectionner une date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

### Autres composants UI

- **Alert** : Messages d'alerte
- **Avatar** : Images de profil circulaires
- **Badge** : Étiquettes de statut
- **Checkbox** : Cases à cocher
- **Command** : Palette de commandes (Cmd+K)
- **Dropdown Menu** : Menus contextuels
- **Label** : Étiquettes de formulaire
- **Popover** : Contenu contextuel
- **Separator** : Séparateurs visuels
- **Sheet** : Panneau latéral
- **Skeleton** : Placeholder de chargement
- **Tooltip** : Info-bulles
- **Textarea** : Zone de texte multiligne

## 📝 Composants domaine métier

### EducationCreateForm

Formulaire de création d'une formation.

```tsx
import { EducationCreateForm } from "~/app/_components/education";

export default function Page() {
  return <EducationCreateForm />;
}
```

**Fonctionnalités :**
- Validation avec Zod
- Champs : school, degree, startDate, endDate, detailsMd
- Date picker pour les dates
- Mutation tRPC pour la création
- Toast notifications
- Redirection après succès

### EducationUpdateForm

Formulaire de modification d'une formation.

```tsx
import { EducationUpdateForm } from "~/app/_components/education";

export default function Page({ params }: { params: { slug: string } }) {
  return <EducationUpdateForm id={params.slug} />;
}
```

**Fonctionnalités :**
- Chargement des données existantes
- Pré-remplissage du formulaire
- Mutation tRPC pour la mise à jour

### EducationDataTable

Table de données pour lister les formations.

```tsx
import { EducationDataTable } from "~/app/_components/education";

export default function Page() {
  return <EducationDataTable />;
}
```

**Fonctionnalités :**
- Affichage en table
- Colonnes : school, degree, dates
- Actions : éditer, supprimer
- Tri et pagination
- Basé sur TanStack Table

### Pattern similaire pour Experience, Skill, User

Les composants Experience, Skill et User suivent le même pattern :
- `CreateForm` : Création
- `UpdateForm` : Édition
- `DataTable` : Listing

## 🖊️ Lexical Editor

### LexicalEditor

Éditeur de texte riche pour le contenu markdown.

```tsx
import { LexicalEditor } from "~/app/_components/lexical";

function MyComponent() {
  const [html, setHtml] = useState("");
  const [json, setJson] = useState("");

  return (
    <LexicalEditor
      initialContent={json}
      onChangeHTML={setHtml}
      onChangeJSON={setJson}
      placeholder="Commencez à écrire..."
    />
  );
}
```

**Props :**
- `initialContent` : Contenu initial (JSON Lexical)
- `onChangeHTML` : Callback avec HTML généré
- `onChangeJSON` : Callback avec JSON Lexical
- `placeholder` : Texte placeholder

**Fonctionnalités :**
- Formatage texte (gras, italique, souligné)
- Titres (H1, H2, H3)
- Listes (ordonnées, non-ordonnées)
- Citations
- Code
- Liens
- Markdown shortcuts
- Barre d'outils

### Display

Affichage du contenu Lexical en lecture seule.

```tsx
import { LexicalDisplay } from "~/app/_components/lexical";

function MyComponent({ content }: { content: string }) {
  return <LexicalDisplay content={content} />;
}
```

## 🔗 Navigation

### Navbar

Barre de navigation principale.

```tsx
import { Navbar } from "~/app/_components/navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
```

**Fonctionnalités :**
- Logo/Titre
- Menu de navigation
- Bouton de connexion/déconnexion
- Responsive (menu burger sur mobile)

### ConnectionButton

Bouton pour se connecter/déconnecter.

```tsx
import { ConnectionButton } from "~/app/_components/connection-button";

<ConnectionButton />
```

**Affiche :**
- "Se connecter" si non authentifié
- "Se déconnecter (nom)" si authentifié

## 📊 Data Table générique

### DataTable

Composant de table réutilisable avec TanStack Table.

```tsx
import { DataTable } from "~/app/_components/data-table";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Education>[] = [
  {
    accessorKey: "school",
    header: "École",
  },
  {
    accessorKey: "degree",
    header: "Diplôme",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button onClick={() => handleEdit(row.original)}>
        Éditer
      </Button>
    ),
  },
];

<DataTable columns={columns} data={educations} />
```

**Fonctionnalités :**
- Tri par colonne
- Pagination
- Filtrage
- Actions personnalisables
- Responsive

## 🎨 Styling & Theming

### Utilisation de Tailwind

Tous les composants utilisent Tailwind CSS :

```tsx
<div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">
  <Button className="bg-blue-500 hover:bg-blue-600">
    Custom
  </Button>
</div>
```

### Utilitaire `cn()`

Fusion intelligente des classes Tailwind :

```tsx
import { cn } from "~/lib/utils";

<Button 
  className={cn(
    "base-classes",
    isActive && "active-classes",
    className
  )}
/>
```

### Class Variance Authority (CVA)

Variants typés pour les composants :

```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-red-500",
      },
      size: {
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);
```

## 🔧 Bonnes pratiques

### 1. Server vs Client Components

```tsx
// Server Component (par défaut)
export default async function Page() {
  const data = await api.education.getAll();
  return <EducationList data={data} />;
}

// Client Component (avec "use client")
"use client";
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <Button onClick={() => setState(...)}>Click</Button>;
}
```

### 2. Composition de composants

```tsx
// ❌ Mauvais : Composant monolithique
function BigForm() {
  return (
    <form>
      {/* 500 lignes de JSX */}
    </form>
  );
}

// ✅ Bon : Composants composables
function EducationForm() {
  return (
    <form>
      <PersonalInfoSection />
      <DatesSection />
      <DetailsSection />
    </form>
  );
}
```

### 3. Props typing

```tsx
// ✅ Bon : Props typées
interface EducationCardProps {
  education: Education;
  onEdit?: (id: string) => void;
  className?: string;
}

export function EducationCard({ 
  education, 
  onEdit, 
  className 
}: EducationCardProps) {
  // ...
}
```

### 4. Gestion des états de chargement

```tsx
function EducationList() {
  const { data, isLoading, error } = api.education.getAll.useQuery();

  if (isLoading) return <EducationSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return <Table data={data} />;
}
```

### 5. Accessibilité

```tsx
// ✅ Labels appropriés
<FormLabel htmlFor="school">École</FormLabel>
<Input id="school" aria-required="true" />

// ✅ ARIA attributes
<Button aria-label="Fermer" onClick={onClose}>
  <X />
</Button>

// ✅ Keyboard navigation
<Dialog onOpenAutoFocus={(e) => e.preventDefault()}>
```

## 📚 Ajouter un nouveau composant UI

### Avec shadcn/ui CLI

```bash
# Ajouter un composant shadcn
npx shadcn@latest add [component-name]

# Exemples
npx shadcn@latest add tabs
npx shadcn@latest add card
npx shadcn@latest add accordion
```

### Manuellement

1. Créer le fichier dans `src/app/_components/ui/`
2. Utiliser Radix UI comme base
3. Styler avec Tailwind CSS
4. Exporter avec types TypeScript

```tsx
// src/app/_components/ui/my-component.tsx
import * as React from "react";
import { cn } from "~/lib/utils";

export interface MyComponentProps 
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "custom";
}

export function MyComponent({ 
  variant = "default", 
  className,
  ...props 
}: MyComponentProps) {
  return (
    <div
      className={cn(
        "base-classes",
        variant === "custom" && "custom-classes",
        className
      )}
      {...props}
    />
  );
}
```

## 📚 Ressources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lexical Documentation](https://lexical.dev/docs/intro)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
