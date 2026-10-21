import { Autowired, Service } from '@forinda/kickjs'
import { MediaService } from '@/common/media/media.service'

type ArticleLike = { thumbnail?: string | null; createdBy?: unknown }

/** Swaps stored keys for signed URLs (thumbnail + populated author avatar). Response-only, never saved. */
@Service()
export class ArticlePresenter {
  @Autowired() private readonly media!: MediaService

  async present<T extends ArticleLike>(article: T) {
    if (article.thumbnail) article.thumbnail = await this.media.url(article.thumbnail, 'thumbnail')
    const author = article.createdBy as { avatar?: string | null } | null | undefined
    if (author && typeof author === 'object' && author.avatar) {
      author.avatar = await this.media.url(author.avatar, 'avatar')
    }
    return article
  }

  presentAll<T extends ArticleLike>(articles: T[]) {
    return Promise.all(articles.map((a) => this.present(a)))
  }
}
