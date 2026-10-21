import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ArticlePresenter } from '../article.presenter'
import { CATEGORY_FIELDS } from '../article.queries'

@Service()
export class GetMyArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute(articleId: string, userId: string) {
    const article = await this.db.Blog.findOne({ _id: articleId, createdBy: userId }).populate(
      'category',
      CATEGORY_FIELDS,
    )
    return article ? this.presenter.present(article) : null
  }
}
