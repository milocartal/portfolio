"use client";

import { Fragment } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import {
  Binary,
  Blocks,
  Briefcase,
  type LucideIcon,
  Newspaper,
  Origami,
  ScrollText,
  UsersRound,
  Link as LinkIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { withSessionProvider } from "~/utils/withSessionProvider";

import { Button } from "~/app/_components/ui/button";
import { Link as ShadLink } from "~/app/_components/ui/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "~/app/_components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/app/_components/ui/collapsible";
import { SidebarUserNav } from "./navbar-footer";

interface NavLink {
  title: string;
  label?: string;
  href?: string;
  icon: LucideIcon;
  children?: NavLinkChildren[];
}

interface NavLinkChildren {
  title: string;
  label?: string;
  href: string;
  icon: LucideIcon;
}

type ExclusiveNavLink =
  | (NavLink & { href: string; children?: never })
  | (NavLink & { href?: never; children: NavLinkChildren[] });

const links: ExclusiveNavLink[][] = [
  [
    { title: "Profil", href: "/admin/profile", icon: Binary },
    {
      title: "Expériences scolaires",
      href: "/admin/educations",
      icon: Newspaper,
    },
    {
      title: "Expériences professionnelles",
      href: "/admin/experiences",
      icon: Briefcase,
    },
    { title: "Compétences", href: "/admin/skills", icon: Blocks },
    {
      title: "Projets",
      href: "/admin/projects",
      icon: Origami,
    },
    {
      title: "Liens",
      href: "/admin/links",
      icon: LinkIcon,
    },
    {
      title: "CVs",
      href: "/admin/cvs",
      icon: ScrollText,
    },
    {
      title: "Utilisateurs",
      href: "/admin/users",
      icon: UsersRound,
    },
  ],
];

interface NavbarProps {
  readonly session: Session | null;
}

const NavbarOne: React.FC<NavbarProps> = ({ session }) => {
  const path = usePathname();

  const { open, isMobile, setOpenMobile } = useSidebar();

  if (
    path.includes("/forgot-password") ||
    path.includes("/reset-password") ||
    path.includes("/register") ||
    path.includes("/login")
  ) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-primary items-center justify-center border-b px-0 py-2">
        <Link
          href="/admin"
          className="cursor-pointer"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
        >
          <div className="flex h-16 items-center justify-center">
            <h1 className="libertinus text-start text-2xl font-black text-white uppercase">
              {open ? "PORTFOLIO" : "P"}
            </h1>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {links.map((group, index) => {
          return (
            <Fragment key={index}>
              <SidebarGroup>
                {group.map((link, index) => {
                  return <NavItem key={link.title + index} link={link} />;
                })}
              </SidebarGroup>
              {index !== links.length - 1 && <SidebarSeparator />}
            </Fragment>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserNav session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const Navbar = withSessionProvider(NavbarOne);

export default Navbar;

function NavItem({ link }: { readonly link: NavLink }) {
  const pathname = usePathname();
  if (link.href) {
    return (
      <SidebarMenu>
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton asChild tooltip={link.title}>
            <ShadLink
              href={link.href}
              className={cn(
                "justify-start",
                !pathname.includes(link.href) && "text-text",
              )}
              variant={pathname.includes(link.href) ? "default" : null}
            >
              <link.icon
                className={cn(
                  "h-4 w-4",
                  pathname.includes(link.href) ? "text-secondary" : "text-text",
                )}
              />
              <span>{link.title}</span>
            </ShadLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  } else if (link.children) {
    return (
      <SidebarMenu>
        <Collapsible
          defaultOpen={link.children.some((child) =>
            pathname.includes(child.href),
          )}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton asChild tooltip={link.label}>
                <Button
                  className={cn(
                    "justify-start",
                    !link.children.some((child) =>
                      pathname.includes(child.href),
                    ) && "text-text",
                  )}
                  variant={
                    link.children.some((child) => pathname.includes(child.href))
                      ? "default"
                      : null
                  }
                >
                  <link.icon
                    className={cn(
                      "h-4 w-4",
                      link.children.some((child) =>
                        pathname.includes(child.href),
                      )
                        ? "text-secondary"
                        : "text-text",
                    )}
                  />
                  <span>{link.title}</span>
                </Button>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {link.children.map((child) => {
                  return (
                    <SidebarMenuSubItem key={child.href} className="">
                      <SidebarMenuSubButton asChild>
                        <ShadLink
                          href={child.href}
                          className={cn(
                            "justify-start",
                            !pathname.includes(child.href) && "text-text",
                          )}
                          variant={
                            pathname.includes(child.href) ? "default" : null
                          }
                        >
                          <child.icon
                            className={cn(
                              "h-4 w-4",
                              pathname.includes(child.href)
                                ? "text-secondary"
                                : "text-text",
                            )}
                          />
                          <span>{child.title}</span>
                        </ShadLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    );
  }
  return null;
}
