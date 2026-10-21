import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { UserPresenter } from '@/common/presenters/user.presenter'
import type { ListWriterRequestsQuery } from '../dtos/writer-request.dto'

const USER_FIELDS = { name: 1, firstName: 1, lastName: 1, email: 1, avatar: 1, createdAt: 1 }

type Applicant = {
  _id: string
  name: string
  firstName?: string | null
  lastName?: string | null
  email: string
  avatar?: string | null
  createdAt: Date
}
type Reviewer = { _id: string; name: string; firstName?: string | null; lastName?: string | null }

@Service()
export class ListWriterRequestsUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute({ status, page, limit }: ListWriterRequestsQuery) {
    const filter = status ? { status } : {}
    const [items, total] = await Promise.all([
      this.db.WriterRequest.find(filter)
        // Oldest pending first is fairest for a review queue; decided ones newest first.
        .sort(status === 'pending' ? { createdAt: 1 } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate<{ user: Applicant | null }>('user', USER_FIELDS)
        .populate<{ reviewedBy: Reviewer | null }>('reviewedBy', { name: 1, firstName: 1, lastName: 1 })
        .lean(),
      this.db.WriterRequest.countDocuments(filter),
    ])
    const presented = await Promise.all(
      items.map(async (r) => ({ ...r, user: r.user ? await this.users.present(r.user) : null })),
    )
    return { items: presented, total, page, limit }
  }
}
