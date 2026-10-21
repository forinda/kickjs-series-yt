import { JWT, JwtDecoded } from '@/utils/jwt'
import { DB } from '@/db'
import { defineRouteFlag } from '@forinda/kickjs'
import { defineHttpContextDecorator, HttpException } from '@forinda/kickjs'

/** Who is calling, resolved once per request from the token and the database. */
export type AuthContext = JwtDecoded['payload'] & {
  /** The role's permission bits (0 when the user has no role). */
  permissions: number
  role: string | null
}

declare module '@forinda/kickjs' {
  interface ContextMeta {
    auth: AuthContext
  }
}

export const Auth = defineHttpContextDecorator({
  key: 'auth',
  deps: { jwt: JWT, db: DB },
  skipWhen: 'auth.public',
  // 401 before validation's 422, and route @Middleware (e.g. rate limits) can read ctx.get('auth').
  beforeValidation: true,
  resolve: async (ctx, { jwt, db }): Promise<AuthContext> => {
    const { authorization } = ctx.headers
    if (!authorization) {
      throw HttpException.unauthorized('No authorization header')
    }
    let payload: JwtDecoded['payload']
    try {
      const token = authorization.replace('Bearer ', '')
      payload = ((await jwt.verify(token)) as unknown as JwtDecoded).payload
    } catch {
      throw HttpException.unauthorized('Invalid authorization token')
    }
    // The token alone isn't enough: a deleted or disabled account must lose access now,
    // not when its token expires. One query also yields the role for PermissionRequired.
    const user = await db.User.findById(payload.id, { disabled: 1, role: 1 })
      .populate<{ role: { name: string; permissions: number } | null }>('role', { name: 1, permissions: 1 })
      .lean()
    if (!user) throw HttpException.unauthorized('Account no longer exists')
    // 401, not 403: the session itself is no longer valid, so clients sign the user out.
    if (user.disabled) throw HttpException.unauthorized('This account has been disabled')
    return { ...payload, permissions: user.role?.permissions ?? 0, role: user.role?.name ?? null }
  },
})

export const PublicRoute = defineRouteFlag('auth.public')
