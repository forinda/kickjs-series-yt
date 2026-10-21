import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ROLE_FIELDS, UserPresenter } from '@/common/presenters/user.presenter'
import type { UpdateProfileDTO } from '../dtos/update-profile.dto'

@Service()
export class UpdateProfileUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute(userId: string, dto: UpdateProfileDTO) {
    const user = await this.db.User.findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .select('-password')
      .populate('role', ROLE_FIELDS)
    if (!user) throw HttpException.notFound('User not found')
    return this.users.present(user.toObject())
  }
}
