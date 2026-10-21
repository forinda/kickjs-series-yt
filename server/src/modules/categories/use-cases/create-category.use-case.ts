import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryNameAvailable } from '../category.queries'
import type { CreateCategoryDTO } from '../dtos/create-category.dto'

@Service()
export class CreateCategoryUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, dto: CreateCategoryDTO) {
    await assertCategoryNameAvailable(this.db, dto.name)
    return this.db.Category.create({ ...dto, createdBy: userId, updatedBy: userId })
  }
}
