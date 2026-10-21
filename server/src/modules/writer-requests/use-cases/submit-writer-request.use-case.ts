import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import type { AuthContext } from '@/contributors/auth.contributor'
import { hasPermission } from '@/common/permissions/permissions'
import type { SubmitWriterRequestDTO } from '../dtos/writer-request.dto'

const DUPLICATE_KEY = 11000

@Service()
export class SubmitWriterRequestUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(auth: AuthContext, dto: SubmitWriterRequestDTO) {
    if (hasPermission(auth.permissions, 'WRITE')) {
      throw HttpException.badRequest('You can already write articles')
    }
    // A user has one role. Approving a Moderator as Writer would remove their moderation,
    // so only people on the default role can ask; others talk to an admin directly.
    const defaultRole = await this.db.Role.findOne({ isDefault: true }, { name: 1 }).lean()
    if (auth.role !== defaultRole?.name) {
      throw HttpException.badRequest('Ask an administrator to change your role')
    }
    try {
      const created = await this.db.WriterRequest.create({ user: auth.id, message: dto.message })
      return created.toObject()
    } catch (error) {
      // The partial unique index allows one pending request per user.
      if ((error as { code?: number }).code === DUPLICATE_KEY) {
        throw HttpException.conflict('You already have a request waiting for review')
      }
      throw error
    }
  }
}
