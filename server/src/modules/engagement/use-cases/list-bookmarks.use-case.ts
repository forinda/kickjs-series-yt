import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { ArticlePresenter } from '@/modules/articles/article.presenter'
import { AUTHOR_FIELDS, CATEGORY_FIELDS } from '@/modules/articles/article.queries'
import type { PageQuery } from '../dtos/engagement.dto'

/** The reader's saved articles, newest bookmark first. Articles no longer live are skipped. */
@Service()
export class ListBookmarksUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute(userId: string, { page, limit }: PageQuery) {
    const saved = await this.db.Reaction.find({ user: userId, kind: 'bookmark' }, { article: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean()
    const live = { _id: { $in: saved.map((s) => s.article) }, status: 'published' as const, takedown: null }
    const total = await this.db.Blog.countDocuments(live)
    const articles = await this.db.Blog.find(live, { body: 0 })
      .populate('createdBy', AUTHOR_FIELDS)
      .populate('category', CATEGORY_FIELDS)
    // Keep bookmark order (most recently saved first), then page.
    const order = new Map(saved.map((s, i) => [String(s.article), i]))
    articles.sort((a, b) => order.get(String(a._id))! - order.get(String(b._id))!)
    const pageItems = articles.slice((page - 1) * limit, page * limit)
    return { items: await this.presenter.presentAll(pageItems), total, page, limit }
  }
}
