import { Autowired, Inject, Service } from '@forinda/kickjs'
import { EngagementCleanupService } from '@/modules/engagement/engagement-cleanup.service'
import { DB, type Db } from '@/db'

@Service()
export class DeleteAccountUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly engagement!: EngagementCleanupService

  async execute(userId: string) {
    await this.db.User.deleteOne({ _id: userId })
    await this.db.WriterRequest.deleteMany({ user: userId })
    await this.engagement.forUser(userId)
  }
}
