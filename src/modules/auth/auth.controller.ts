import { Controller, Get, Post, Put, Delete, Autowired, reply, type Ctx } from '@forinda/kickjs'
import { AuthService } from './auth.service'
import { registerAuthSchema } from './dtos/register-auth.dto'
import { loginAuthSchema } from './dtos/login-auth.dto'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { assignRoleSchema } from './dtos/assign-role.dto'

@Controller()
@ApiBearerAuth()
@ApiTags('Auth')
@PublicRoute
export class AuthController {
  @Autowired() private readonly authService!: AuthService

  @Get('/profile')
  @PublicRoute.off
  async getProfile(ctx: Ctx<KickRoutes.AuthController['getProfile']>) {
    const result = await this.authService.me(ctx.require('auth').id)
    if (!result) {
      ctx.problem.notFound({ detail: `Auth ${ctx.require('auth').id} not found` })
      return
    }
    return result
  }

  @Post('/sign-up', { body: registerAuthSchema, name: 'CreateAuth' })
  async register(ctx: Ctx<KickRoutes.AuthController['register']>) {
    return reply.created(await this.authService.create(ctx.body))
  }
  @Post('/sign-in', { body: loginAuthSchema, name: 'LoginAuth' })
  async login(ctx: Ctx<KickRoutes.AuthController['login']>) {
    console.log(ctx.get('auth'))
    return reply.ok(await this.authService.login(ctx.body))
  }

  @Put('/update-profile', { body: loginAuthSchema, name: 'UpdateAuth' })
  @PublicRoute.off
  async updateProfile(ctx: Ctx<KickRoutes.AuthController['updateProfile']>) {
    return this.authService.update(ctx.require('auth').id, ctx.body)
  }

  @Delete('/delete-profile')
  @PublicRoute.off
  async deleteProfile(ctx: Ctx<KickRoutes.AuthController['deleteProfile']>) {
    await this.authService.delete(ctx.require('auth').id)
    return reply.noContent()
  }

  @Post('/setup', { name: 'SetupAuth' })
  @PublicRoute
  async setup(_ctx: Ctx<KickRoutes.AuthController['setup']>) {
    await this.authService.setup()
    return reply.noContent()
  }

  @Post('/assign-role', { name: 'AssignRole', body: assignRoleSchema })
  @PublicRoute.off
  async assignRole(ctx: Ctx<KickRoutes.AuthController['assignRole']>) {
    await this.authService.assignRole(ctx.body)
    return reply.noContent()
  }
}
