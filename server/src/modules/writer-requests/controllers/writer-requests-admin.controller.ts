import { Autowired, Controller, Get, Put, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { PermissionRequired } from '@/contributors/permission.contributor'
import { listWriterRequestsQuerySchema, reviewWriterRequestSchema } from '../dtos/writer-request.dto'
import { ListWriterRequestsUseCase } from '../use-cases/list-writer-requests.use-case'
import { ReviewWriterRequestUseCase } from '../use-cases/review-writer-request.use-case'

/** Admin review queue. Mounted at /writer-requests. */
@Controller()
@ApiBearerAuth()
@ApiTags('Writer requests')
export class WriterRequestsAdminController {
  @Autowired() private readonly listRequests!: ListWriterRequestsUseCase
  @Autowired() private readonly review!: ReviewWriterRequestUseCase

  @Get('/', { query: listWriterRequestsQuerySchema, name: 'ListWriterRequests' })
  @PermissionRequired({ permission: 'ADMIN' })
  async list(ctx: Ctx<KickRoutes.WriterRequestsAdminController['list']>) {
    return this.listRequests.execute(ctx.query)
  }

  @Put('/:id/approve', { body: reviewWriterRequestSchema, name: 'ApproveWriterRequest' })
  @PermissionRequired({ permission: 'ADMIN' })
  async approve(ctx: Ctx<KickRoutes.WriterRequestsAdminController['approve']>) {
    return this.review.execute(ctx.require('auth').id, ctx.params.id, 'approved', ctx.body.note)
  }

  @Put('/:id/reject', { body: reviewWriterRequestSchema, name: 'RejectWriterRequest' })
  @PermissionRequired({ permission: 'ADMIN' })
  async reject(ctx: Ctx<KickRoutes.WriterRequestsAdminController['reject']>) {
    return this.review.execute(ctx.require('auth').id, ctx.params.id, 'rejected', ctx.body.note)
  }
}
