import { defineModule } from '@forinda/kickjs'
import { MyWriterRequestController } from './controllers/my-writer-request.controller'
import { MyWriterRequestsController } from './controllers/my-writer-requests.controller'
import { WriterRequestsAdminController } from './controllers/writer-requests-admin.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const WriterRequestsModule = defineModule({
  name: 'WriterRequestsModule',
  build: () => ({
    routes() {
      return [
        { path: '/me/writer-request', controller: MyWriterRequestController },
        { path: '/me/writer-requests', controller: MyWriterRequestsController },
        { path: '/writer-requests', controller: WriterRequestsAdminController },
      ]
    },
  }),
})
