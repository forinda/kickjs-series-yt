import { Autowired, Service } from '@forinda/kickjs'
import { MediaService, URL_TTL } from '@/common/media/media.service'
import { ARTICLE_IMAGE_FILE, ARTICLE_IMAGE_FOLDER } from '../article-html'

/** Fresh signed URL for an embedded image, or null for a name that can't be one of ours. */
@Service()
export class GetArticleImageUrlUseCase {
  @Autowired() private readonly media!: MediaService

  async execute(file: string) {
    if (!ARTICLE_IMAGE_FILE.test(file)) return null
    return { url: await this.media.url(`${ARTICLE_IMAGE_FOLDER}/${file}`, 'thumbnail'), ttl: URL_TTL.thumbnail }
  }
}
