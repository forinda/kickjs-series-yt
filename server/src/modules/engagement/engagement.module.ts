import { defineModule } from '@forinda/kickjs'
import { ArticleEngagementController } from './controllers/article-engagement.controller'
import { CommentsController } from './controllers/comments.controller'
import { CommentSettingsController } from './controllers/comment-settings.controller'
import { BookmarksController } from './controllers/bookmarks.controller'

import.meta.glob(['./**/*.ts', '!./**/*.test.ts', '!./**/*.d.ts'], { eager: true })

/** Likes, bookmarks and comments. */
export const EngagementModule = defineModule({
  name: 'EngagementModule',
  build: () => ({
    routes() {
      return [
        { path: '/articles', controller: ArticleEngagementController },
        { path: '/comments', controller: CommentsController },
        { path: '/manage/articles', controller: CommentSettingsController },
        { path: '/me/bookmarks', controller: BookmarksController },
      ]
    },
  }),
})
