import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { MediaService, type UploadedFile } from '@/common/media/media.service'
import { GetProfileUseCase } from './get-profile.use-case'

/** Upload a new avatar (file) or clear it (null). The previous file is deleted either way. */
@Service()
export class SetAvatarUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly media!: MediaService
  @Autowired() private readonly getProfile!: GetProfileUseCase

  async execute(userId: string, file: UploadedFile | null) {
    const key = file ? await this.media.put(`avatars/${userId}`, file) : null
    const previous = await this.db.User.findByIdAndUpdate(userId, { $set: { avatar: key } })
    if (!previous) {
      await this.media.remove(key)
      throw HttpException.notFound('User not found')
    }
    await this.media.remove(previous.avatar)
    return this.getProfile.execute(userId)
  }
}
