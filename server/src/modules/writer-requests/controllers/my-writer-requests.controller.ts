import { Autowired, Controller, Get, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { ListMyWriterRequestsUseCase } from '../use-cases/list-my-writer-requests.use-case'

/** The user's request history. Mounted at /me/writer-requests. */
@Controller()
@ApiBearerAuth()
@ApiTags('Writer requests')
export class MyWriterRequestsController {
  @Autowired() private readonly listMine!: ListMyWriterRequestsUseCase

  @Get('/', { name: 'ListMyWriterRequests' })
  async list(ctx: Ctx<KickRoutes.MyWriterRequestsController['list']>) {
    return this.listMine.execute(ctx.require('auth').id)
  }
}
