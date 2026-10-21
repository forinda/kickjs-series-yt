import { defineModule } from '@forinda/kickjs'
import { PublicArticlesController } from './controllers/public-articles.controller'
import { ArticleAuthoringController } from './controllers/article-authoring.controller'
import { MyArticlesController } from './controllers/my-articles.controller'
import { ArticleModerationController } from './controllers/article-moderation.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

export const ArticlesModule = defineModule({
  name: 'ArticlesModule',
  build: () => ({
    routes() {
      return [
        { path: '/articles', controller: PublicArticlesController },
        { path: '/articles', controller: ArticleAuthoringController },
        { path: '/me/articles', controller: MyArticlesController },
        { path: '/manage/articles', controller: ArticleModerationController },
      ]
    },
  }),
})
