import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ArticlePresenter } from '../article.presenter'
import { AUTHOR_FIELDS, CATEGORY_FIELDS } from '../article.queries'

@Service()
export class ListPublicArticlesUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute() {
    // ponytail: returns every status incl. drafts, as before; published-only filtering is the next step.
    const articles = await this.db.Blog.find()
      .populate('createdBy', AUTHOR_FIELDS)
      .populate('category', CATEGORY_FIELDS)
    return this.presenter.presentAll(articles)
  }
}
