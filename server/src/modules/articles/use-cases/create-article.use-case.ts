import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryUsable } from '../article.queries'
import type { CreateArticleDTO } from '../dtos/create-article.dto'

@Service()
export class CreateArticleUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, dto: CreateArticleDTO) {
    await assertCategoryUsable(this.db, dto.category, userId)
    if (await this.db.Blog.exists({ title: dto.title, createdBy: userId })) {
      throw HttpException.conflict('You already have an article with this title')
    }
    const created = await this.db.Blog.create({ ...dto, createdBy: userId, updatedBy: userId })
    return created.toObject()
  }
}
