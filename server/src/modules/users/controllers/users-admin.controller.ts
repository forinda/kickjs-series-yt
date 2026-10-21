import { Autowired, Controller, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { assignRoleSchema } from '../dtos/assign-role.dto'
import { AssignRoleUseCase } from '../use-cases/assign-role.use-case'

/** Admin-only user management. */
@Controller()
@ApiBearerAuth()
@ApiTags('Users')
export class UsersAdminController {
  @Autowired() private readonly assignRole!: AssignRoleUseCase

  @Put('/:id/role', { body: assignRoleSchema, name: 'AssignRole' })
  @PermissionRequired({ permission: 'ADMIN' })
  async updateRole(ctx: Ctx<KickRoutes.UsersAdminController['updateRole']>) {
    await this.assignRole.execute(ctx.params.id, ctx.body.roleId)
    return reply.noContent()
  }
}
