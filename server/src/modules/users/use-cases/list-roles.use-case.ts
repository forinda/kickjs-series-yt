import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class ListRolesUseCase {
  @Inject(DB) private readonly db!: Db

  execute() {
    return this.db.Role.find({}, { name: 1, description: 1, permissions: 1, isDefault: 1 })
      .sort({ permissions: 1 })
      .lean()
  }
}
