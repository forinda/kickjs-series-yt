import { defineModule } from '@forinda/kickjs'
import { BlogsController } from './blogs.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const BlogsModule = defineModule({
  name: 'BlogsModule',
  build: () => ({
    routes() {
      return {
        path: '/blogs',
        controller: BlogsController,
      }
    },
  }),
})
