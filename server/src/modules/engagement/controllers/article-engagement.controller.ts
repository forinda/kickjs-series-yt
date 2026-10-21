import { Autowired, Controller, Delete, Get, Post, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { addCommentSchema, pageQuerySchema } from '../dtos/engagement.dto'
import { AddCommentUseCase } from '../use-cases/add-comment.use-case'
import { GetEngagementUseCase } from '../use-cases/get-engagement.use-case'
import { ListCommentsUseCase } from '../use-cases/list-comments.use-case'
import { ReactUseCase } from '../use-cases/react.use-case'

/** Reader engagement on one article. Mounted at /articles. */
@Controller()
@ApiBearerAuth()
@ApiTags('Engagement')
export class ArticleEngagementController {
  @Autowired() private readonly react!: ReactUseCase
  @Autowired() private readonly getEngagement!: GetEngagementUseCase
  @Autowired() private readonly listComments!: ListCommentsUseCase
  @Autowired() private readonly addComment!: AddCommentUseCase

  /** Counts plus the signed-in reader's own like/bookmark state. */
  @Get('/:id/engagement', { name: 'GetEngagement' })
  async engagement(ctx: Ctx<KickRoutes.ArticleEngagementController['engagement']>) {
    return this.getEngagement.execute(ctx.require('auth').id, ctx.params.id)
  }

  @Put('/:id/like', { name: 'LikeArticle' })
  async like(ctx: Ctx<KickRoutes.ArticleEngagementController['like']>) {
    await this.react.execute(ctx.require('auth').id, ctx.params.id, 'like', true)
    return this.getEngagement.execute(ctx.require('auth').id, ctx.params.id)
  }

  @Delete('/:id/like', { name: 'UnlikeArticle' })
  async unlike(ctx: Ctx<KickRoutes.ArticleEngagementController['unlike']>) {
    await this.react.execute(ctx.require('auth').id, ctx.params.id, 'like', false)
    return this.getEngagement.execute(ctx.require('auth').id, ctx.params.id)
  }

  @Put('/:id/bookmark', { name: 'BookmarkArticle' })
  async bookmark(ctx: Ctx<KickRoutes.ArticleEngagementController['bookmark']>) {
    await this.react.execute(ctx.require('auth').id, ctx.params.id, 'bookmark', true)
    return this.getEngagement.execute(ctx.require('auth').id, ctx.params.id)
  }

  @Delete('/:id/bookmark', { name: 'UnbookmarkArticle' })
  async unbookmark(ctx: Ctx<KickRoutes.ArticleEngagementController['unbookmark']>) {
    await this.react.execute(ctx.require('auth').id, ctx.params.id, 'bookmark', false)
    return this.getEngagement.execute(ctx.require('auth').id, ctx.params.id)
  }

  @Get('/:id/comments', { query: pageQuerySchema, name: 'ListComments' })
  @PublicRoute
  async comments(ctx: Ctx<KickRoutes.ArticleEngagementController['comments']>) {
    return this.listComments.execute(ctx.params.id, ctx.query)
  }

  @Post('/:id/comments', { body: addCommentSchema, name: 'AddComment' })
  @PermissionRequired({ permission: 'COMMENT' })
  async comment(ctx: Ctx<KickRoutes.ArticleEngagementController['comment']>) {
    return reply.created(await this.addComment.execute(ctx.require('auth').id, ctx.params.id, ctx.body.body))
  }
}
