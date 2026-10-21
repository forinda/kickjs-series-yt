import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { MediaService, type UploadedFile } from '@/common/media/media.service'
import { findOwnedArticle } from '../article.queries'

@Service()
export class SetArticleThumbnailUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly media!: MediaService

  async execute(articleId: string, userId: string, file: UploadedFile) {
    // Ownership first, so nothing is uploaded for someone else's article.
    const article = await findOwnedArticle(this.db, articleId, userId)
    const key = await this.media.put('thumbnails', file)
    const previous = article.thumbnail
    article.thumbnail = key
    await article.save()
    await this.media.remove(previous)
    return { key }
  }
}
