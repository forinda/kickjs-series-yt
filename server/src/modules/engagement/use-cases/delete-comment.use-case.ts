import { HttpException, Inject, Service } from '@forinda/kickjs'
import { DB, type Db } from '@/db'
import type { AuthContext } from '@/contributors/auth.contributor'
import { hasPermission } from '@/common/permissions/permissions'

/** Authors remove their own comments; moderators remove anyone's. */
@Service()
export class DeleteCommentUseCase {
  @Inject(DB) private readonly db!: Db

  async execute(auth: AuthContext, commentId: string) {
    const comment = await this.db.Comment.findById(commentId, { author: 1, article: 1 })
    if (!comment) throw HttpException.notFound('Comment not found')
    if (String(comment.author) !== auth.id && !hasPermission(auth.permissions, 'MODERATE')) {
      throw HttpException.forbidden('You can only delete your own comments')
    }
    await comment.deleteOne()
    await this.db.Blog.updateOne({ _id: comment.article }, { $inc: { commentCount: -1 } })
  }
}
