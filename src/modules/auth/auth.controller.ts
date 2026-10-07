import { Controller, Get, Post, Put, Delete, Autowired, reply, type Ctx } from '@forinda/kickjs'
import { AuthService } from './auth.service'
import { registerAuthSchema } from './dtos/register-auth.dto'
import { loginAuthSchema } from './dtos/login-auth.dto'

@Controller()
export class AuthController {
  @Autowired() private readonly authService!: AuthService

  @Get('/profile/:id')
  async getProfile(ctx: Ctx<KickRoutes.AuthController['getProfile']>) {
    const result = await this.authService.me(ctx.params.id)
    if (!result) {
      ctx.problem.notFound({ detail: `Auth ${ctx.params.id} not found` })
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

  @Put('/update-profile/:id', { body: loginAuthSchema, name: 'UpdateAuth' })
  async updateProfile(ctx: Ctx<KickRoutes.AuthController['updateProfile']>) {
    return this.authService.update(ctx.params.id, ctx.body)
  }

  @Delete('/delete-profile/:id')
  async deleteProfile(ctx: Ctx<KickRoutes.AuthController['deleteProfile']>) {
    await this.authService.delete(ctx.params.id)
    return reply.noContent()
  }
}
