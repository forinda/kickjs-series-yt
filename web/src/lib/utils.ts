export { cn } from "cn"

type Named = { name?: string | null; firstName?: string | null; lastName?: string | null };

// First + last name when either is set, otherwise the account name.
export const displayName = (user?: Named | null) =>
  [user?.firstName, user?.lastName].filter((s) => s?.trim()).join(" ") || user?.name || "";

export const initials = (user?: Named | null) =>
  displayName(user)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
