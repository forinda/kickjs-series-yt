import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

/** Every request the user has made, newest first, so they can follow its progress and history. */
@Service()
export class ListMyWriterRequestsUseCase {
  @Inject(DB) private readonly db!: Db

  execute(userId: string) {
    return this.db.WriterRequest.find({ user: userId }, { user: 0, reviewedBy: 0 }).sort({ createdAt: -1 }).lean()
  }
}
