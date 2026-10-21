import { Autowired, Controller, Post, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { SetupSystemUseCase } from '@/modules/auth/use-cases/setup-system.use-case'

/** Admin maintenance. Mounted at /system. */
@Controller()
@ApiBearerAuth()
@ApiTags('Users')
export class SystemController {
  @Autowired() private readonly setupSystem!: SetupSystemUseCase

  /** Re-sync system roles (names, defaults, permissions) and run data backfills. */
  @Post('/sync', { name: 'SyncSystem' })
  @PermissionRequired({ permission: 'ADMIN' })
  async sync(_ctx: Ctx<KickRoutes.SystemController['sync']>) {
    await this.setupSystem.sync()
    return reply.noContent()
  }
}
