import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

/** Moderators open or close the comments on an article. Existing comments stay visible. */
@Service()
export class SetCommentsEnabledUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(articleId: string, enabled: boolean) {
    const { matchedCount } = await this.db.Blog.updateOne({ _id: articleId }, { $set: { commentsEnabled: enabled } })
    if (!matchedCount) throw HttpException.notFound('Article not found')
  }
}
