import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryUsable, findOwnedArticle } from '../article.queries'
import type { UpdateArticleDTO } from '../dtos/create-article.dto'

@Service()
export class UpdateArticleUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(articleId: string, userId: string, dto: UpdateArticleDTO) {
    const article = await findOwnedArticle(this.db, articleId, userId)
    if (dto.category) await assertCategoryUsable(this.db, dto.category, userId)
    Object.assign(article, dto, { updatedBy: userId })
    await article.save()
  }
}
