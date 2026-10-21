import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { comparePassword } from '@/utils/password'
import { UserPresenter } from '@/common/presenters/user.presenter'
import { SessionService } from '../session.service'
import type { LoginAuthDTO } from '../dtos/login-auth.dto'

@Service()
export class SignInUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly sessions!: SessionService
  @Autowired() private readonly users!: UserPresenter

  async execute(dto: LoginAuthDTO) {
    const found = await this.db.User.findOne({ email: dto.email }).populate('role', {
      name: 1,
      permissions: 1,
    })
    // Same message for unknown email and wrong password: don't reveal which accounts exist.
    if (!found) throw HttpException.badRequest('Invalid email or password')
    const { password, ...user } = found.toObject()
    if (!(await comparePassword(dto.password!, password))) {
      throw HttpException.badRequest('Invalid email or password')
    }
    return { user: await this.users.present(user), jwt: await this.sessions.issue(user) }
  }
}
