import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { hashPassword } from '@/utils/password'
import { UserPresenter } from '@/common/presenters/user.presenter'
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
    const created = await this.db.User.create({ ...dto, password: await hashPassword(dto.password) })
    const { password: _, ...user } = created.toObject()
    return { user: await this.users.present(user), jwt: await this.sessions.issue(user) }
  }
}
