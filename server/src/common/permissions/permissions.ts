/***
 * 2^0 = 1 = 00000001 = FOLLOW
 *2^1 = 2 = 00000010 = COMMENT
 *2^2 = 4 = 00000100 = WRITE
 *2^3 = 8 = 00001000 = MODERATE
 *2^4 = 16= 00010000 = ADMIN
 */
export const PERMISSIONS = {
  FOLLOW: 1 << 0, // 1
  COMMENT: 1 << 1, // 2
  WRITE: 1 << 2, // 4
  MODERATE: 1 << 3, // 8
  ADMIN: 1 << 4, // 16
} as const

export const systemRoles = {
  USER: {
    name: 'User',
    description: 'Regular user with basic permissions.',
    isDefault: true,
    permissions: () => [PERMISSIONS.FOLLOW, PERMISSIONS.COMMENT],
  },
  WRITER: {
    name: 'Writer',
    isDefault: false,
    description: 'User with write permissions.',
    permissions: () => [...systemRoles.USER.permissions(), PERMISSIONS.WRITE],
  },
  // Moderators keep the community in order (comments, reactions); they don't publish.
  // Not derived from WRITER on purpose: moderation and authorship are separate grants.
  MODERATOR: {
    name: 'Moderator',
    isDefault: false,
    description: 'Moderates articles and comments; cannot publish.',
    permissions: () => [...systemRoles.USER.permissions(), PERMISSIONS.MODERATE],
  },
  ADMIN: {
    name: 'Admin',
    isDefault: false,
    description: 'User with all permissions.',
    permissions: () => [
      ...systemRoles.USER.permissions(),
      PERMISSIONS.WRITE,
      PERMISSIONS.MODERATE,
      PERMISSIONS.ADMIN,
    ],
  },
} as const

export type SystemRoles = typeof systemRoles

/** Bitmask check: does a role's `permissions` value include `key`? */
export const hasPermission = (permissions: number, key: PermissionKeys) =>
  (permissions & PERMISSIONS[key]) === PERMISSIONS[key]
export type PermissionKeys = keyof typeof PERMISSIONS
