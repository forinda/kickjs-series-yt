import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ArticlePresenter } from '../article.presenter'
import { CATEGORY_FIELDS } from '../article.queries'

@Service()
export class ListMyArticlesUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute(userId: string) {
    const articles = await this.db.Blog.find({ createdBy: userId }).populate('category', CATEGORY_FIELDS)
    return this.presenter.presentAll(articles)
  }
}
