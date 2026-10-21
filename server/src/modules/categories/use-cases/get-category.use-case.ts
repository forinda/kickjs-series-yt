import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class GetCategoryUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(categoryId: string) {
    const category = await this.db.Category.findById(categoryId)
    if (!category) throw HttpException.notFound(`Category ${categoryId} not found`)
    return category
  }
}
