import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { MediaService } from '@/common/media/media.service'
import { ARTICLE_IMAGE_FILE, ARTICLE_IMAGE_FOLDER, embeddedImageFiles } from './article-html'

/** Uploads younger than this are left alone by the sweep: they may belong to a draft being written. */
const SWEEP_GRACE_MS = 24 * 60 * 60 * 1000

/** Keeps article-images/ in step with what article bodies actually reference. */
@Service()
export class ArticleImagesService {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly media!: MediaService

  private isReferenced(file: string) {
    // File names are [a-f0-9]{16}.ext, so only the dot needs escaping.
    return this.db.Blog.exists({ body: { $regex: file.replace('.', '\\.') } })
  }

  /**
   * Delete images a body no longer uses (`previous` minus `next`), unless some article
   * still embeds them — e.g. a writer pasted the same image into another article.
   */
  async release(previous: string | null | undefined, next: string | null | undefined) {
    const kept = embeddedImageFiles(next)
    for (const file of embeddedImageFiles(previous)) {
      if (kept.has(file) || (await this.isReferenced(file))) continue
      await this.media.remove(`${ARTICLE_IMAGE_FOLDER}/${file}`)
    }
  }

  /** Delete uploads older than the grace period that no article embeds (abandoned drafts). */
  async sweep() {
    const cutoff = Date.now() - SWEEP_GRACE_MS
    let scanned = 0
    let removed = 0
    for await (const { key, lastModified } of this.media.list(ARTICLE_IMAGE_FOLDER)) {
      scanned++
      const file = key.slice(ARTICLE_IMAGE_FOLDER.length + 1)
      if (!ARTICLE_IMAGE_FILE.test(file) || lastModified.getTime() > cutoff) continue
      if (await this.isReferenced(file)) continue
      await this.media.remove(key)
      removed++
    }
    return { scanned, removed }
  }
}
