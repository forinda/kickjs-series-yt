import { Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'

/** The user's most recent request (pending or decided), or null. */
@Service()
export class GetMyWriterRequestUseCase {
  @Inject(DB) private readonly db!: Db

  execute(userId: string) {
    return this.db.WriterRequest.findOne({ user: userId }, { reviewedBy: 0 }).sort({ createdAt: -1 }).lean()
  }
}
