import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import type { Types } from 'mongoose'
import { DB, type Db } from '@/db'
import { hashPassword } from '@/utils/password'
import { ROLE_FIELDS, UserPresenter } from '@/common/presenters/user.presenter'
import { SessionService } from '../session.service'
import type { RegisterAuthDTO } from '../dtos/register-auth.dto'

@Service()
export class SignUpUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly sessions!: SessionService
  @Autowired() private readonly users!: UserPresenter

  async execute(dto: RegisterAuthDTO) {
    if (await this.db.User.exists({ email: dto.email })) {
      throw HttpException.conflict('Email already in use')
    }
    // Null until setup has run; the setup backfill assigns it then.
    const defaultRole = await this.db.Role.findOne({ isDefault: true })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
    const created = await this.db.User.create({
      ...dto,
      password: await hashPassword(dto.password),
      role: defaultRole?._id ?? null,
    })
    await created.populate('role', ROLE_FIELDS)
    const { password: _, ...user } = created.toObject()
    return { user: await this.users.present(user), jwt: await this.sessions.issue(user) }
  }
}
