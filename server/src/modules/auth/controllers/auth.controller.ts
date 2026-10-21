import { Autowired, Controller, Post, reply, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { registerAuthSchema } from '../dtos/register-auth.dto'
import { loginAuthSchema } from '../dtos/login-auth.dto'
import { SignUpUseCase } from '../use-cases/sign-up.use-case'
import { SignInUseCase } from '../use-cases/sign-in.use-case'
import { SetupSystemUseCase } from '../use-cases/setup-system.use-case'

/** Unauthenticated entry points: create an account, get a session, seed the system. */
@Controller()
@ApiTags('Auth')
@PublicRoute
export class AuthController {
  @Autowired() private readonly signUp!: SignUpUseCase
  @Autowired() private readonly signIn!: SignInUseCase
  @Autowired() private readonly setupSystem!: SetupSystemUseCase

  @Post('/sign-up', { body: registerAuthSchema, name: 'SignUp' })
  async register(ctx: Ctx<KickRoutes.AuthController['register']>) {
    return reply.created(await this.signUp.execute(ctx.body))
  }

  @Post('/sign-in', { body: loginAuthSchema, name: 'SignIn' })
  async login(ctx: Ctx<KickRoutes.AuthController['login']>) {
    return reply.ok(await this.signIn.execute(ctx.body))
  }

  @Post('/setup', { name: 'SetupSystem' })
  async setup(_ctx: Ctx<KickRoutes.AuthController['setup']>) {
    await this.setupSystem.execute()
    return reply.noContent()
  }
}
