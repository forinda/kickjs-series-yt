import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryExists, findOwnedArticle, publishedAtPatch } from '../article.queries'
import { sanitizeArticleHtml } from '../article-html'
import { ArticleImagesService } from '../article-images.service'
import type { UpdateArticleDTO } from '../dtos/create-article.dto'

@Service()
export class UpdateArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly images!: ArticleImagesService

  async execute(articleId: string, userId: string, dto: UpdateArticleDTO) {
    const article = await findOwnedArticle(this.db, articleId, userId)
    if (dto.category) await assertCategoryExists(this.db, dto.category)
    if (dto.status === 'published' && article.takedown) {
      throw HttpException.conflict('A moderator took this article down. It can be republished once they restore it.')
    }
    const previousBody = article.body // before Object.assign overwrites it with the raw dto.body
    Object.assign(article, dto, publishedAtPatch(dto.status, article.publishedAt), { updatedBy: userId })
    if (dto.body !== undefined) article.body = sanitizeArticleHtml(dto.body)
    await article.save()
    // After saving, so the "still referenced elsewhere?" check sees the new body.
    if (dto.body !== undefined) await this.images.release(previousBody, article.body)
  }
}
