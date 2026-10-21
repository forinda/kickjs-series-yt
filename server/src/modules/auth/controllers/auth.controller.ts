import { Autowired, Controller, Post, reply, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { registerAuthSchema } from '../dtos/register-auth.dto'
import { loginAuthSchema } from '../dtos/login-auth.dto'
import { SignUpUseCase } from '../use-cases/sign-up.use-case'
import { SignInUseCase } from '../use-cases/sign-in.use-case'
import { SetupSystemUseCase } from '../use-cases/setup-system.use-case'
import { SessionService } from '../session.service'
import { Types } from 'mongoose'

/** Unauthenticated entry points: create an account, get a session, seed the system. */
@Controller()
@ApiTags('Auth')
@PublicRoute
export class AuthController {
  @Autowired() private readonly signUp!: SignUpUseCase
  @Autowired() private readonly signIn!: SignInUseCase
  @Autowired() private readonly setupSystem!: SetupSystemUseCase
  @Autowired() private readonly sessions!: SessionService

  @Post('/sign-up', { body: registerAuthSchema, name: 'SignUp' })
  async register(ctx: Ctx<KickRoutes.AuthController['register']>) {
    return reply.created(await this.signUp.execute(ctx.body))
  }

  @Post('/sign-in', { body: loginAuthSchema, name: 'SignIn' })
  async login(ctx: Ctx<KickRoutes.AuthController['login']>) {
    return reply.ok(await this.signIn.execute(ctx.body))
  }

  /**
   * Swap a still-valid token for a fresh one (sliding sessions). Goes through the normal
   * auth check, so disabled or deleted accounts can't refresh.
   */
  @Post('/refresh', { name: 'RefreshSession' })
  @PublicRoute.off
  async refresh(ctx: Ctx<KickRoutes.AuthController['refresh']>) {
    const { id, name } = ctx.require('auth')
    return { jwt: await this.sessions.issue({ _id: new Types.ObjectId(id), name }) }
  }

  /** First-run only: refuses once an admin exists (admins use POST /system/sync). */
  @Post('/setup', { name: 'SetupSystem' })
  async setup(_ctx: Ctx<KickRoutes.AuthController['setup']>) {
    await this.setupSystem.bootstrap()
    return reply.noContent()
  }
}
