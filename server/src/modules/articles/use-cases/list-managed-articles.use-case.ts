import { Autowired, Inject, Service } from '@forinda/kickjs'
import type { QueryFilter } from 'mongoose'
import { DB, type Db } from '@/db'
import type { BlogType } from '@/db/models/blog'
import { ArticlePresenter } from '../article.presenter'
import { AUTHOR_FIELDS, CATEGORY_FIELDS } from '../article.queries'
import type { ListManagedArticlesQuery } from '../dtos/manage-articles.dto'

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Every article in any status, for moderators and admins. */
@Service()
export class ListManagedArticlesUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly presenter!: ArticlePresenter

  async execute({ q, status, takenDown, category, author, page, limit }: ListManagedArticlesQuery) {
    const filter: QueryFilter<BlogType> = {}
    if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' }
    if (status) filter.status = status
    if (takenDown) filter.takedown = takenDown === 'true' ? { $ne: null } : null
    if (category) filter.category = category
    if (author) filter.createdBy = author

    const [items, total] = await Promise.all([
      this.db.Blog.find(filter, { body: 0 }) // bodies can be large; the table doesn't need them
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', { ...AUTHOR_FIELDS, email: 1 })
        .populate('category', CATEGORY_FIELDS)
        .populate('takedown.by', { name: 1, firstName: 1, lastName: 1 }),
      this.db.Blog.countDocuments(filter),
    ])
    return { items: await this.presenter.presentAll(items), total, page, limit }
  }
}
