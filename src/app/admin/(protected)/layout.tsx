import Navbar from "~/app/_components/navbar";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "~/app/_components/ui/sidebar";

export default async function ConnectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <Navbar session={session} />
      <main className="relative max-h-screen min-h-screen w-full overflow-y-auto">
        {children}
      </main>
    </SidebarProvider>
  );
}
