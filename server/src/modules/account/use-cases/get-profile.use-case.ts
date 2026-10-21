import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { UserPresenter } from '@/common/presenters/user.presenter'

@Service()
export class GetProfileUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute(userId: string) {
    const user = await this.db.User.findById(userId).select('-password').populate('role', { name: 1 })
    if (!user) throw HttpException.notFound('User not found')
    return this.users.present(user.toObject())
  }
}
