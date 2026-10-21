import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { systemRoles } from '@/common/permissions/permissions'

/** Approve (grant the Writer role) or reject a pending request. */
@Service()
export class ReviewWriterRequestUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(reviewerId: string, requestId: string, decision: 'approved' | 'rejected', note?: string) {
    // Claim the request atomically: two admins clicking at once can't both decide it.
    const request = await this.db.WriterRequest.findOneAndUpdate(
      { _id: requestId, status: 'pending' },
      { $set: { status: decision, reviewedBy: reviewerId, reviewedAt: new Date(), reviewNote: note || null } },
      { new: true },
    )
    if (!request) {
      const exists = await this.db.WriterRequest.exists({ _id: requestId })
      throw exists ? HttpException.conflict('This request has already been reviewed') : HttpException.notFound('Request not found')
    }
    if (decision === 'approved') {
      const writer = await this.db.Role.findOne({ name: systemRoles.WRITER.name }, { _id: 1 })
      if (!writer) throw HttpException.internal('Writer role missing; run setup')
      await this.db.User.updateOne({ _id: request.user }, { $set: { role: writer._id } })
    }
    return request.toObject()
  }
}
