import { defineModule } from '@forinda/kickjs'
import { CategoriesController } from './controllers/categories.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const CategoriesModule = defineModule({
  name: 'CategoriesModule',
  build: () => ({
    routes() {
      return { path: '/categories', controller: CategoriesController }
    },
  }),
})
