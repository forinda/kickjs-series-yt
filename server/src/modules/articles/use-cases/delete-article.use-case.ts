import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { MediaService } from '@/common/media/media.service'
import { findOwnedArticle } from '../article.queries'
import { ArticleImagesService } from '../article-images.service'

@Service()
export class DeleteArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly media!: MediaService
  @Autowired() private readonly images!: ArticleImagesService

  async execute(articleId: string, userId: string) {
    const article = await findOwnedArticle(this.db, articleId, userId)
    await article.deleteOne()
    await this.media.remove(article.thumbnail)
    await this.images.release(article.body, null)
  }
}
