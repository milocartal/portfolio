import { AccessControl, type Query } from "accesscontrol";
import type { Session } from "next-auth";

export const ac = new AccessControl();

//Anonyme
ac.grant("viewer")
  .readAny("public")
  .createOwn("cv")
  .readAny("cv")
  .readAny("education")
  .readAny("experience")
  .readAny("project")
  .readAny("skill")
  .readAny("profile");

//Admin
ac.grant("admin")
  .readAny("user")
  .createAny("user")
  .updateAny("user")
  .deleteAny("user")

  .createAny("education")
  .updateAny("education")
  .deleteAny("education")

  .createAny("project")
  .updateAny("project")
  .deleteAny("project")

  .createAny("skill")
  .updateAny("skill")
  .deleteAny("skill")

  .createAny("experience")
  .updateAny("experience")
  .deleteAny("experience")

  .createAny("profile")
  .updateAny("profile")
  .deleteAny("profile");

/**
 * Determines the access control query based on the user's session role.
 *
 * @param session - The current user session, or `null` if no session exists.
 * @returns The access control query for the appropriate role (`viewer`, `editor`, or `admin`).
 */
export function can(session: Session | null): Query {
  let role = "viewer";
  if (!session) return ac.can(role);

  if (session.user.role.includes("admin")) role = "admin";

  return ac.can(role);
}

export const GlobalRoles: string[] = ["viewer", "admin"];

export enum GlobalRolesEnum {
  VIEWER = "viewer",
  ADMIN = "admin",
}

/**
 * Format a role string by capitalizing the first letter of each word and
 * joining words with a space.
 *
 * @param role The role string to format
 * @returns A formatted role string
 * @example
 * formatRole("aidant-particulier") // "Aidant-Particulier"
 */
export function formatRole(role: string) {
  return role
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Normalize a role string by converting it to lowercase and removing any
 * diacritics (accents, umlauts, etc.).
 *
 * @param role The role string to normalize
 * @returns A normalized role string
 * @example
 * normalizeRole("Aidant-Particuli r") // "aidant-particulier"
 */
export function normalizeRole(role: string) {
  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
