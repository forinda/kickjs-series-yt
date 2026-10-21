import { Autowired, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { UserPresenter } from '@/common/presenters/user.presenter'
import { COMMENT_AUTHOR_FIELDS, findLiveArticle } from '../engagement.queries'
import type { PageQuery } from '../dtos/engagement.dto'

type CommentAuthor = { _id: string; name: string; firstName?: string | null; lastName?: string | null; avatar?: string | null }

@Service()
export class ListCommentsUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute(articleId: string, { page, limit }: PageQuery) {
    const article = await findLiveArticle(this.db, articleId)
    const [items, total] = await Promise.all([
      this.db.Comment.find({ article: articleId }, { article: 0 })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate<{ author: CommentAuthor | null }>('author', COMMENT_AUTHOR_FIELDS)
        .lean(),
      this.db.Comment.countDocuments({ article: articleId }),
    ])
    const presented = await Promise.all(
      items.map(async (c) => ({ ...c, author: c.author ? await this.users.present(c.author) : null })),
    )
    return { items: presented, total, page, limit, commentsEnabled: article.commentsEnabled }
  }
}
