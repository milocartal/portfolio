import Link from "next/link";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";

interface FooterProps {
  name?: string;
}

export const Footer: React.FC<FooterProps> = ({ name = "Portfolio" }) => {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/mentions-legales"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Mentions légales
          </Link>
          <Link
            href="/politique-de-confidentialite"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Politique de confidentialité
          </Link>
          <Dialog>
            <DialogTrigger className="hover:text-foreground cursor-pointer underline-offset-4 hover:underline">
              Gérer les cookies
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gestion des cookies</DialogTitle>
              </DialogHeader>
              <p>Aucun cookies n&apos;est géré pour le moment.</p>
              <DialogFooter>
                <DialogClose>Ok</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-muted-foreground text-center text-sm">
          <p>
            © {new Date().getFullYear()} {name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
