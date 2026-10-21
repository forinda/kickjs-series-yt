import { defineModule } from '@forinda/kickjs'
import { UsersAdminController } from './controllers/users-admin.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const UsersModule = defineModule({
  name: 'UsersModule',
  build: () => ({
    routes() {
      return { path: '/users', controller: UsersAdminController }
    },
  }),
})
