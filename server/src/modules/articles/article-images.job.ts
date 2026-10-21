import { Autowired, Cron, Logger, Service, type CronRun } from '@forinda/kickjs'
import { ArticleImagesService } from './article-images.service'

const log = Logger.for('ArticleImagesJob')

/** Daily clean-up of embedded-image uploads no article uses (e.g. abandoned drafts). */
@Service()
export class ArticleImagesJob {
  @Autowired() private readonly images!: ArticleImagesService

  // 03:30 server time, when traffic is lowest. The sweep only touches files older than 24h.
  @Cron('30 3 * * *', { name: 'sweep-article-images', description: 'Delete unused article image uploads' })
  async sweep(run: CronRun) {
    const { scanned, removed } = await this.images.sweep()
    log.info(`[${run.trigger}] scanned ${scanned} image(s), removed ${removed}`)
  }
}
