import { defineModule } from '@forinda/kickjs'
import { FeedsController } from './feeds.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const FeedsModule = defineModule({
  name: 'FeedsModule',
  build: () => ({
    routes() {
      // At the root (/rss.xml, /sitemap.xml, /robots.txt, /blogs/:id), not under /api/v1.
      return [{ path: '/', controller: FeedsController, prefix: false, version: false }]
    },
  }),
})
