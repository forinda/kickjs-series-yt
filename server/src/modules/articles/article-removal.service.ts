import { Autowired, Service } from '@forinda/kickjs'
import type { HydratedDocument } from 'mongoose'
import type { BlogType } from '@/db/models/blog'
import { MediaService } from '@/common/media/media.service'
import { ArticleImagesService } from './article-images.service'

/** Deletes an article and the files only it used (thumbnail, embedded images). */
@Service()
export class ArticleRemovalService {
  @Autowired() private readonly media!: MediaService
  @Autowired() private readonly images!: ArticleImagesService

  async remove(article: HydratedDocument<BlogType>) {
    await article.deleteOne()
    await this.media.remove(article.thumbnail)
    await this.images.release(article.body, null)
  }
}
