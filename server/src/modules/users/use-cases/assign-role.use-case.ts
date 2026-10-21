import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class AssignRoleUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string, roleId: string) {
    if (!(await this.db.Role.exists({ _id: roleId }))) throw HttpException.notFound('Role not found')
    const user = await this.db.User.findByIdAndUpdate(userId, { $set: { role: roleId } })
    if (!user) throw HttpException.notFound('User not found')
  }
}
