import { HttpException } from '@forinda/kickjs'
import type { Db } from '@/db'

/** An article readers can see (published, not taken down), or 404. */
export async function findLiveArticle(db: Db, articleId: string) {
  const article = await db.Blog.findOne(
    { _id: articleId, status: 'published', takedown: null },
    { likeCount: 1, commentCount: 1, commentsEnabled: 1 },
  )
  if (!article) throw HttpException.notFound('Article not found')
  return article
}

/** Author fields shown next to a comment. */
export const COMMENT_AUTHOR_FIELDS = { name: 1, firstName: 1, lastName: 1, avatar: 1 }
