import { Autowired, Controller, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { commentSettingsSchema } from '../dtos/engagement.dto'
import { SetCommentsEnabledUseCase } from '../use-cases/set-comments-enabled.use-case'

/** Moderators open/close comments per article. Mounted at /manage/articles. */
@Controller()
@ApiBearerAuth()
@ApiTags('Article moderation')
export class CommentSettingsController {
  @Autowired() private readonly setEnabled!: SetCommentsEnabledUseCase

  @Put('/:id/comments', { body: commentSettingsSchema, name: 'SetCommentsEnabled' })
  @PermissionRequired({ permission: 'MODERATE' })
  async update(ctx: Ctx<KickRoutes.CommentSettingsController['update']>) {
    await this.setEnabled.execute(ctx.params.id, ctx.body.enabled)
    return reply.noContent()
  }
}
