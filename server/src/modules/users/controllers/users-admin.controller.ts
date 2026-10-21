import { Autowired, Controller, Get, Put, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { assignRoleSchema } from '../dtos/assign-role.dto'
import { listUsersQuerySchema } from '../dtos/list-users.dto'
import { setUserStatusSchema } from '../dtos/set-user-status.dto'
import { AssignRoleUseCase } from '../use-cases/assign-role.use-case'
import { ListUsersUseCase } from '../use-cases/list-users.use-case'
import { SetUserStatusUseCase } from '../use-cases/set-user-status.use-case'

/** Admin-only user management. */
@Controller()
@ApiBearerAuth()
@ApiTags('Users')
export class UsersAdminController {
  @Autowired() private readonly listUsers!: ListUsersUseCase
  @Autowired() private readonly assignRole!: AssignRoleUseCase
  @Autowired() private readonly setStatus!: SetUserStatusUseCase

  @Get('/', { query: listUsersQuerySchema, name: 'ListUsers' })
  @PermissionRequired({ permission: 'ADMIN' })
  async list(ctx: Ctx<KickRoutes.UsersAdminController['list']>) {
    return this.listUsers.execute(ctx.query)
  }

  @Put('/:id/role', { body: assignRoleSchema, name: 'AssignRole' })
  @PermissionRequired({ permission: 'ADMIN' })
  async updateRole(ctx: Ctx<KickRoutes.UsersAdminController['updateRole']>) {
    await this.assignRole.execute(ctx.require('auth').id, ctx.params.id, ctx.body.roleId)
    return reply.noContent()
  }

  @Put('/:id/status', { body: setUserStatusSchema, name: 'SetUserStatus' })
  @PermissionRequired({ permission: 'ADMIN' })
  async updateStatus(ctx: Ctx<KickRoutes.UsersAdminController['updateStatus']>) {
    await this.setStatus.execute(ctx.require('auth').id, ctx.params.id, ctx.body.disabled)
    return reply.noContent()
  }
}
