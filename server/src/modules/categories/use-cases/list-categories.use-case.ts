import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import type { ListCategoriesQuery } from '../dtos/list-categories.dto'

/** Searches return a short list for pickers; no query returns everything (admin table). */
const SEARCH_LIMIT = 20

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

@Service()
export class ListCategoriesUseCase {
  @Inject(DB) private readonly db!: Db

  execute({ q }: ListCategoriesQuery = {}) {
    const query = this.db.Category.find(q ? { name: { $regex: escapeRegex(q), $options: 'i' } } : {})
      .sort({ name: 1 })
      .populate('createdBy', { id: 1, name: 1 })
    return q ? query.limit(SEARCH_LIMIT) : query
  }
}
