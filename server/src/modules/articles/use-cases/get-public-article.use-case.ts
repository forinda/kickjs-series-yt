import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ArticlePresenter } from '../article.presenter'
import { AUTHOR_FIELDS, CATEGORY_FIELDS } from '../article.queries'

@Service()
export class GetPublicArticleUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute(articleId: string) {
    // Drafts/archived read as missing, not forbidden, so their existence isn't leaked.
    const article = await this.db.Blog.findOne({ _id: articleId, status: 'published' })
      .populate('createdBy', AUTHOR_FIELDS)
      .populate('category', CATEGORY_FIELDS)
    return article ? this.presenter.present(article) : null
  }
}
