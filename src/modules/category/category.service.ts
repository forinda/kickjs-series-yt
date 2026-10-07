import { Service, Inject, getRequestValue } from '@forinda/kickjs'
import type { ParsedQuery } from '@forinda/kickjs'
import { getAuditObj } from '@/utils/session'
import type { CategoryResponseDTO } from './dtos/category-response.dto'
import type { CreateCategoryDTO } from './dtos/create-category.dto'
import type { UpdateCategoryDTO } from './dtos/update-category.dto'
import { Db, DB } from '@/db'


@Service()
export class CategoryService {
  constructor(@Inject(DB) private readonly repo: Db) {}

  async findById(id: string): Promise<CategoryResponseDTO | null> {
    const { id: userId } = getRequestValue('auth')!
    return this.repo.Category.findOne({ id, createdBy: userId })
  }

  async findAll() {
    const { id: userId } = getRequestValue('auth')!
    return await this.repo.Category.find({ createdBy: userId }).populate(
      'createdBy',
      { id: 1, name: 1 },
      // 'User',
    )
  }

  async findPaginated(q: ParsedQuery) {
    const { limit, offset } = q.pagination
    const { id: userId } = getRequestValue('auth')!
    return this.repo.Category.find({ createdBy: userId })
      .populate('createdBy', { id: 1, name: 1 })
      .limit(limit ?? 10)
      .skip(offset ?? 0)
  }

  async create(dto: CreateCategoryDTO) {
    const payload = getAuditObj(dto, 'create')
    return this.repo.Category.create(payload)
  }

  async update(id: string, dto: UpdateCategoryDTO) {
    const payload = getAuditObj(dto, 'update')
    const { id: userId } = getRequestValue('auth')!
    return this.repo.Category.updateOne({ id, createdBy: userId }, payload)
  }

  async delete(id: string): Promise<void> {
    const { id: userId } = getRequestValue('auth')!
    await this.repo.Category.deleteOne({ id, createdBy: userId })
  }
}
