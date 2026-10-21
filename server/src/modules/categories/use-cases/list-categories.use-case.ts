import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class ListCategoriesUseCase {
  @Inject(DB) private readonly db!: Db

  execute() {
    return this.db.Category.find().populate('createdBy', { id: 1, name: 1 })
  }
}
