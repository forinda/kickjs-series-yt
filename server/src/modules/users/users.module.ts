import { defineModule } from '@forinda/kickjs'
import { UsersAdminController } from './controllers/users-admin.controller'
import { RolesController } from './controllers/roles.controller'
import { SystemController } from './controllers/system.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const UsersModule = defineModule({
  name: 'UsersModule',
  build: () => ({
    routes() {
      return [
        { path: '/users', controller: UsersAdminController },
        { path: '/roles', controller: RolesController },
        { path: '/system', controller: SystemController },
      ]
    },
  }),
})
