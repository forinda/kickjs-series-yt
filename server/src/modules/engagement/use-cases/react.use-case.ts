import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { findLiveArticle } from '../engagement.queries'

const DUPLICATE_KEY = 11000
export type ReactionKind = 'like' | 'bookmark'

/** Like/unlike and bookmark/unbookmark. Idempotent: repeating either is a no-op. */
@Service()
export class ReactUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, articleId: string, kind: ReactionKind, on: boolean) {
    await findLiveArticle(this.db, articleId)
    if (on) {
      try {
        await this.db.Reaction.create({ kind, article: articleId, user: userId })
        if (kind === 'like') await this.db.Blog.updateOne({ _id: articleId }, { $inc: { likeCount: 1 } })
      } catch (error) {
        // Already liked/bookmarked: the unique index caught it, nothing to change.
        if ((error as { code?: number }).code !== DUPLICATE_KEY) throw error
      }
    } else {
      const { deletedCount } = await this.db.Reaction.deleteOne({ kind, article: articleId, user: userId })
      if (deletedCount && kind === 'like') await this.db.Blog.updateOne({ _id: articleId }, { $inc: { likeCount: -1 } })
    }
  }
}
