// Mirrors server/src/common/permissions/permissions.ts. The server enforces these;
// the client only uses them to hide what the user can't do anyway.
export const PERMISSIONS = {
  FOLLOW: 1 << 0,
  COMMENT: 1 << 1,
  WRITE: 1 << 2,
  MODERATE: 1 << 3,
  ADMIN: 1 << 4,
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

type WithRole = { role?: unknown } | null | undefined;

/** The role as API responses send it: populated with name and permission bits. */
export const userRole = (user: WithRole) =>
  user && typeof user.role === "object" && user.role !== null
    ? (user.role as { _id?: string; name?: string; permissions?: number })
    : null;

export const can = (user: WithRole, key: PermissionKey) =>
  ((userRole(user)?.permissions ?? 0) & PERMISSIONS[key]) === PERMISSIONS[key];
