import type { Profile } from "@prisma/client";

export interface ProfileUpsertProps {
  profile: Profile | null;
}
