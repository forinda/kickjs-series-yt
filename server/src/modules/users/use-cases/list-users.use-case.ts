import { Autowired, Inject, Service } from '@forinda/kickjs'
import type { QueryFilter } from 'mongoose'
import { DB, type Db } from '@/db'
import type { UserType } from '@/db/models/user'
import { ROLE_FIELDS, UserPresenter } from '@/common/presenters/user.presenter'
import type { ListUsersQuery } from '../dtos/list-users.dto'

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

@Service()
export class ListUsersUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute({ q, role, status, page, limit }: ListUsersQuery) {
    const filter: QueryFilter<UserType> = {}
    if (q) {
      const pattern = { $regex: escapeRegex(q), $options: 'i' }
      filter.$or = [{ name: pattern }, { firstName: pattern }, { lastName: pattern }, { email: pattern }]
    }
    if (role) filter.role = role
    // `disabled` may be missing on accounts created before the field existed.
    if (status) filter.disabled = status === 'disabled' ? true : { $ne: true }

    const [items, total] = await Promise.all([
      this.db.User.find(filter, { password: 0 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('role', ROLE_FIELDS)
        .lean(),
      this.db.User.countDocuments(filter),
    ])
    return { items: await Promise.all(items.map((u) => this.users.present(u))), total, page, limit }
  }
}
