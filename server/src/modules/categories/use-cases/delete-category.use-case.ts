import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class DeleteCategoryUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(categoryId: string) {
    await this.db.Category.deleteOne({ _id: categoryId })
  }
}
