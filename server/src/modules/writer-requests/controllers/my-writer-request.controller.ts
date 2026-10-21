import { Autowired, Controller, Get, Post, reply, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { submitWriterRequestSchema } from '../dtos/writer-request.dto'
import { GetMyWriterRequestUseCase } from '../use-cases/get-my-writer-request.use-case'
import { SubmitWriterRequestUseCase } from '../use-cases/submit-writer-request.use-case'

/** A user's own request to become a writer. Mounted at /me/writer-request. */
@Controller()
@ApiBearerAuth()
@ApiTags('Writer requests')
export class MyWriterRequestController {
  @Autowired() private readonly getMine!: GetMyWriterRequestUseCase
  @Autowired() private readonly submit!: SubmitWriterRequestUseCase

  @Get('/', { name: 'GetMyWriterRequest' })
  async show(ctx: Ctx<KickRoutes.MyWriterRequestController['show']>) {
    return this.getMine.execute(ctx.require('auth').id)
  }

  @Post('/', { body: submitWriterRequestSchema, name: 'SubmitWriterRequest' })
  async create(ctx: Ctx<KickRoutes.MyWriterRequestController['create']>) {
    return reply.created(await this.submit.execute(ctx.require('auth'), ctx.body))
  }
}
