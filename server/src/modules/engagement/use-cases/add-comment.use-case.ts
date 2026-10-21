import { Autowired, HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import { UserPresenter } from '@/common/presenters/user.presenter'
import { COMMENT_AUTHOR_FIELDS, findLiveArticle } from '../engagement.queries'

type CommentAuthor = { _id: string; name: string; firstName?: string | null; lastName?: string | null; avatar?: string | null }

@Service()
export class AddCommentUseCase {
  @Inject(DB) private readonly db!: Db
  @Autowired() private readonly users!: UserPresenter

  async execute(userId: string, articleId: string, body: string) {
    const article = await findLiveArticle(this.db, articleId)
    if (!article.commentsEnabled) throw HttpException.forbidden('Comments are closed on this article')
    const created = await this.db.Comment.create({ article: articleId, author: userId, body })
    await this.db.Blog.updateOne({ _id: articleId }, { $inc: { commentCount: 1 } })
    const comment = await created.populate<{ author: CommentAuthor }>('author', COMMENT_AUTHOR_FIELDS)
    const { article: _, ...rest } = comment.toObject()
    return { ...rest, author: await this.users.present(rest.author) }
  }
}
