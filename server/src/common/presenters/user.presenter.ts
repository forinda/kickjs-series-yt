import { Autowired, Service } from '@forinda/kickjs'
import { MediaService } from '@/common/media/media.service'

/** Shapes a user for responses: `avatar` goes from storage key to signed URL. */
@Service()
export class UserPresenter {
  @Autowired() private readonly media!: MediaService

  async present<T extends { avatar?: string | null }>(user: T) {
    return { ...user, avatar: user.avatar ? await this.media.url(user.avatar, 'avatar') : null }
  }
}
