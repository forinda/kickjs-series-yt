import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { publishedAtPatch } from '../article.queries'
import { ArticleRemovalService } from '../article-removal.service'

/** Moderator/admin actions on any article, regardless of who wrote it. */
@Service()
export class ModerateArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly removal!: ArticleRemovalService

  private async find(articleId: string) {
    const article = await this.db.Blog.findById(articleId)
    if (!article) throw HttpException.notFound('Article not found')
    return article
  }

  /** Hide it from readers and lock publishing until restored. */
  async takeDown(actorId: string, articleId: string, reason: string) {
    const article = await this.find(articleId)
    if (article.takedown) throw HttpException.conflict('This article is already taken down')
    article.set({ status: 'archived', takedown: { by: actorId, at: new Date(), reason } })
    await article.save()
  }

  /** Lift a takedown and put the article back live. */
  async restore(articleId: string) {
    const article = await this.find(articleId)
    if (!article.takedown) throw HttpException.conflict('This article is not taken down')
    article.set({ status: 'published', takedown: null, ...publishedAtPatch('published', article.publishedAt) })
    await article.save()
  }

  async remove(articleId: string) {
    await this.removal.remove(await this.find(articleId))
  }
}
