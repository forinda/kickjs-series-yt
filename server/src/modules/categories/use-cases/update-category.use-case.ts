import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { assertCategoryNameAvailable } from '../category.queries'
import type { UpdateCategoryDTO } from '../dtos/update-category.dto'

@Service()
export class UpdateCategoryUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(categoryId: string, userId: string, dto: UpdateCategoryDTO) {
    if (dto.name) await assertCategoryNameAvailable(this.db, dto.name, categoryId)
    const updated = await this.db.Category.findByIdAndUpdate(
      categoryId,
      { $set: { ...dto, updatedBy: userId } },
      { new: true },
    )
    if (!updated) throw HttpException.notFound('Category not found')
    return updated
  }
}
