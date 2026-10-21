import { Autowired, Controller, Get, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { ListRolesUseCase } from '../use-cases/list-roles.use-case'

/** Roles an admin can hand out. Mounted at /roles. */
@Controller()
@ApiBearerAuth()
@ApiTags('Users')
export class RolesController {
  @Autowired() private readonly listRoles!: ListRolesUseCase

  @Get('/', { name: 'ListRoles' })
  @PermissionRequired({ permission: 'ADMIN' })
  async list(_ctx: Ctx<KickRoutes.RolesController['list']>) {
    return this.listRoles.execute()
  }
}
