import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

@Service()
export class DeleteAccountUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(userId: string) {
    await this.db.User.deleteOne({ _id: userId })
    await this.db.WriterRequest.deleteMany({ user: userId })
  }
}
