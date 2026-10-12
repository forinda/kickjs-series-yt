import { defineModule } from '@forinda/kickjs'
import { CategoryController } from './category.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const CategoryModule = defineModule({
  name: 'CategoryModule',
  build: () => ({
    contributors: () => [],
    routes() {
      return {
        path: '/category',
        controller: CategoryController,
      }
    },
  }),
})
