import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { findOwnedArticle } from '../article.queries'
import { ArticleRemovalService } from '../article-removal.service'

@Service()
export class DeleteArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly removal!: ArticleRemovalService

  async execute(articleId: string, userId: string) {
    await this.removal.remove(await findOwnedArticle(this.db, articleId, userId))
  }
}
