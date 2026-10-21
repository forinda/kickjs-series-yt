import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { MediaService } from '@/common/media/media.service'
import { ArticleRemovalService } from '@/modules/articles/article-removal.service'
import { EngagementCleanupService } from '@/modules/engagement/engagement-cleanup.service'
import { verifyPassword } from '../account.queries'

/** Deletes the account and everything it owns. Requires the password. */
@Service()
export class DeleteAccountUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly media!: MediaService
  @Autowired() private readonly articles!: ArticleRemovalService
  @Autowired() private readonly engagement!: EngagementCleanupService

  async execute(userId: string, password: string) {
    const user = await verifyPassword(this.db, userId, password)
    // Their articles (and each article's files, likes, bookmarks and comments).
    for (const article of await this.db.Blog.find({ createdBy: userId })) {
      await this.articles.remove(article)
    }
    // Their likes/bookmarks/comments elsewhere, with article counts adjusted.
    await this.engagement.forUser(userId)
    await this.db.WriterRequest.deleteMany({ user: userId })
    await user.deleteOne()
    await this.media.remove(user.avatar)
  }
}
