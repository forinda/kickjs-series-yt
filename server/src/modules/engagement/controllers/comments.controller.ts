import { Autowired, Controller, Delete, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { DeleteCommentUseCase } from '../use-cases/delete-comment.use-case'

/** Mounted at /comments. */
@Controller()
@ApiBearerAuth()
@ApiTags('Engagement')
export class CommentsController {
  @Autowired() private readonly deleteComment!: DeleteCommentUseCase

  @Delete('/:id', { name: 'DeleteComment' })
  async remove(ctx: Ctx<KickRoutes.CommentsController['remove']>) {
    await this.deleteComment.execute(ctx.require('auth'), ctx.params.id)
    return reply.noContent()
  }
}
