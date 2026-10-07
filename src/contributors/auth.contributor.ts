import { JWT, JwtDecoded } from '@/utils/jwt'
import { defineRouteFlag } from '@forinda/kickjs'
import { defineHttpContextDecorator, HttpException } from '@forinda/kickjs'

declare module '@forinda/kickjs' {
  interface ContextMeta {
    auth: JwtDecoded['payload']
  }
}

export const Auth = defineHttpContextDecorator({
  key: 'auth',
  deps: { jwt: JWT },
  skipWhen: 'auth.public',
  resolve: async (ctx, { jwt }) => {
    const { authorization } = ctx.headers
    if (!authorization) {
      throw HttpException.badRequest('No authorization header')
    }
    try {
      const token = authorization.replace('Bearer ', '')
      const payload = (await jwt.verify(token)) as unknown as JwtDecoded
      return payload.payload
    } catch {
      throw HttpException.unauthorized('Invalid authorization token')
    }
  },
})

export const PublicRoute = defineRouteFlag('auth.public')
