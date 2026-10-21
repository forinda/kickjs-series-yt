import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { findLiveArticle } from '../engagement.queries'

/** Counts plus what the signed-in reader has done on this article. */
@Service()
export class GetEngagementUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, articleId: string) {
    const article = await findLiveArticle(this.db, articleId)
    const mine = await this.db.Reaction.find({ user: userId, article: articleId }, { kind: 1 }).lean()
    return {
      likeCount: article.likeCount,
      commentCount: article.commentCount,
      commentsEnabled: article.commentsEnabled,
      liked: mine.some((r) => r.kind === 'like'),
      bookmarked: mine.some((r) => r.kind === 'bookmark'),
    }
  }
}
