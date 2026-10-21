import { Autowired, Controller, Delete, Get, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { listManagedArticlesQuerySchema, takedownArticleSchema } from '../dtos/manage-articles.dto'
import { ListManagedArticlesUseCase } from '../use-cases/list-managed-articles.use-case'
import { ModerateArticleUseCase } from '../use-cases/moderate-article.use-case'

/**
 * Oversight of every article. MODERATE covers moderators and admins (admins hold every bit);
 * deleting someone else's article is admin-only. Mounted at /manage/articles.
 */
@Controller()
@ApiBearerAuth()
@ApiTags('Article moderation')
export class ArticleModerationController {
  @Autowired() private readonly listArticles!: ListManagedArticlesUseCase
  @Autowired() private readonly moderate!: ModerateArticleUseCase

  @Get('/', { query: listManagedArticlesQuerySchema, name: 'ListManagedArticles' })
  @PermissionRequired({ permission: 'MODERATE' })
  async list(ctx: Ctx<KickRoutes.ArticleModerationController['list']>) {
    return this.listArticles.execute(ctx.query)
  }

  @Put('/:id/takedown', { body: takedownArticleSchema, name: 'TakeDownArticle' })
  @PermissionRequired({ permission: 'MODERATE' })
  async takedown(ctx: Ctx<KickRoutes.ArticleModerationController['takedown']>) {
    await this.moderate.takeDown(ctx.require('auth').id, ctx.params.id, ctx.body.reason)
    return reply.noContent()
  }

  @Put('/:id/restore', { name: 'RestoreArticle' })
  @PermissionRequired({ permission: 'MODERATE' })
  async restore(ctx: Ctx<KickRoutes.ArticleModerationController['restore']>) {
    await this.moderate.restore(ctx.params.id)
    return reply.noContent()
  }

  @Delete('/:id', { name: 'DeleteManagedArticle' })
  @PermissionRequired({ permission: 'ADMIN' })
  async remove(ctx: Ctx<KickRoutes.ArticleModerationController['remove']>) {
    await this.moderate.remove(ctx.params.id)
    return reply.noContent()
  }
}
