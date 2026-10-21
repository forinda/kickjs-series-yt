import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class SetUserStatusUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(actorId: string, userId: string, disabled: boolean) {
    // An admin locking themselves out could leave nobody able to undo it.
    if (actorId === userId) throw HttpException.badRequest("You can't change your own account status")
    const user = await this.db.User.findByIdAndUpdate(userId, { $set: { disabled } })
    if (!user) throw HttpException.notFound('User not found')
  }
}
