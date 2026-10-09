import { defineModule } from '@forinda/kickjs'
import { TasksController } from './tasks.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const TasksModule = defineModule({
  name: 'TasksModule',
  build: () => ({
    routes() {
      return {
        path: '/tasks',
        controller: TasksController,
      }
    },
  }),
})
