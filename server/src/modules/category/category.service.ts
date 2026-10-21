import { Service, Inject, HttpException } from '@forinda/kickjs'
import type { ParsedQuery } from '@forinda/kickjs'
import { getAuditObj } from '@/utils/session'
import type { CategoryResponseDTO } from './dtos/category-response.dto'
import type { CreateCategoryDTO } from './dtos/create-category.dto'
import type { UpdateCategoryDTO } from './dtos/update-category.dto'
import { type Db, DB } from '@/db'

@Service()
export class CategoryService {
  constructor(@Inject(DB) private readonly repo: Db) {}

  async findById(id: string): Promise<CategoryResponseDTO | null> {
    return await this.repo.Category.findOne({ _id: id })
  }

  async findAll() {
    return await this.repo.Category.find().populate('createdBy', {
      id: 1,
      name: 1,
    })
  }

  async findPaginated(q: ParsedQuery) {
    const { limit, offset } = q.pagination
    return await this.repo.Category.find({ })
      .populate('createdBy', { id: 1, name: 1 })
      .limit(limit ?? 10)
      .skip(offset ?? 0)
  }

  // Names are unique case-insensitively ("Web Dev" == "web dev").
  private async assertNameAvailable(name: string, exceptId?: string) {
    const existing = await this.repo.Category.findOne({
      name,
      ...(exceptId ? { _id: { $ne: exceptId } } : {}),
    }).collation({ locale: 'en', strength: 2 })
    if (existing) {
      throw HttpException.conflict(`A category named "${name}" already exists`)
    }
  }

  async create(dto: CreateCategoryDTO) {
    const payload = getAuditObj(dto, 'create')
    await this.assertNameAvailable(payload.name)
    return await this.repo.Category.create(payload)
  }

  async update(id: string, dto: UpdateCategoryDTO) {
    const payload = getAuditObj(dto, 'update')
    if (payload.name) await this.assertNameAvailable(payload.name, id)
    const updatedCategory = await this.repo.Category.findByIdAndUpdate({ _id: id }, { $set: payload }, { new: true })
    if (!updatedCategory) {
      throw HttpException.notFound('Category not found')
    }
    return updatedCategory
  }

  async delete(id: string): Promise<void> {
    await this.repo.Category.deleteOne({ _id: id })
  }
}
