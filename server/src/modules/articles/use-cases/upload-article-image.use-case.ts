import { Autowired, HttpException, Service } from '@forinda/kickjs'
import { MediaService, type UploadedFile } from '@/common/media/media.service'
import { ARTICLE_IMAGE_FOLDER, ARTICLE_IMAGE_PATH, ARTICLE_IMAGE_TYPES } from '../article-html'

/** Stores an image for embedding in an article body; returns the stable `src` to put in the HTML. */
@Service()
export class UploadArticleImageUseCase {
  @Autowired() private readonly media!: MediaService

  async execute(file: UploadedFile) {
    const ext = ARTICLE_IMAGE_TYPES[file.mimetype]
    if (!ext) throw HttpException.badRequest('Images must be PNG, JPEG, GIF, WebP or AVIF')
    const key = await this.media.put(ARTICLE_IMAGE_FOLDER, file, ext)
    return { src: ARTICLE_IMAGE_PATH + key.slice(ARTICLE_IMAGE_FOLDER.length + 1) }
  }
}
