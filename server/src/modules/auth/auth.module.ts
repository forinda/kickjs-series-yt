import { defineModule, getEnv } from '@forinda/kickjs'
import { AuthController } from './auth.controller'
import { JWT, Jwt } from '@/utils/jwt'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const AuthModule = defineModule({
  name: 'AuthModule',
  build: () => ({
    routes() {
      return {
        path: '/auth',
        controller: AuthController,
      }
    },
    register(container) {
      container.registerInstance(JWT, new Jwt(getEnv('JWT_SECRET')))
    },
  }),
})
