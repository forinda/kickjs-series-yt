import { defineModule } from '@forinda/kickjs'
import { ProfileController } from './controllers/profile.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const AccountModule = defineModule({
  name: 'AccountModule',
  build: () => ({
    routes() {
      return { path: '/me', controller: ProfileController }
    },
  }),
})
