import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryExists, findOwnedArticle, publishedAtPatch } from '../article.queries'
import { sanitizeArticleHtml } from '../article-html'
import type { UpdateArticleDTO } from '../dtos/create-article.dto'

@Service()
export class UpdateArticleUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(articleId: string, userId: string, dto: UpdateArticleDTO) {
    const article = await findOwnedArticle(this.db, articleId, userId)
    if (dto.category) await assertCategoryExists(this.db, dto.category)
    Object.assign(article, dto, publishedAtPatch(dto.status, article.publishedAt), { updatedBy: userId })
    if (dto.body !== undefined) article.body = sanitizeArticleHtml(dto.body)
    await article.save()
  }
}
