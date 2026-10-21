import { Inject, Service } from '@forinda/kickjs'
import { Types } from 'mongoose'
import { DB, type Db } from '@/db'

/** Removes engagement rows when the thing they hang off goes away, keeping counters right. */
@Service()
export class EngagementCleanupService {
  @Inject(DB) private readonly db!: Db

  /** The article is gone: its likes, bookmarks and comments go too. */
  async forArticle(articleId: Types.ObjectId | string) {
    await Promise.all([
      this.db.Reaction.deleteMany({ article: articleId }),
      this.db.Comment.deleteMany({ article: articleId }),
    ])
  }

  /** The account is gone: drop its rows and take its likes/comments off each article's count. */
  async forUser(userId: string) {
    const [likes, comments] = await Promise.all([
      this.db.Reaction.find({ user: userId, kind: 'like' }, { article: 1 }).lean(),
      this.db.Comment.aggregate<{ _id: unknown; n: number }>([
        { $match: { author: new Types.ObjectId(userId) } }, // aggregate doesn't cast strings
        { $group: { _id: '$article', n: { $sum: 1 } } },
      ]),
    ])
    const decrements = [
      ...likes.map((l) => ({ updateOne: { filter: { _id: l.article }, update: { $inc: { likeCount: -1 } } } })),
      ...comments.map((c) => ({ updateOne: { filter: { _id: c._id }, update: { $inc: { commentCount: -c.n } } } })),
    ]
    if (decrements.length) await this.db.Blog.bulkWrite(decrements as never)
    await Promise.all([
      this.db.Reaction.deleteMany({ user: userId }),
      this.db.Comment.deleteMany({ author: userId }),
    ])
  }
}
