import { Autowired, Controller, Get, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { pageQuerySchema } from '../dtos/engagement.dto'
import { ListBookmarksUseCase } from '../use-cases/list-bookmarks.use-case'

/** The reader's saved articles. Mounted at /me/bookmarks. */
@Controller()
@ApiBearerAuth()
@ApiTags('Engagement')
export class BookmarksController {
  @Autowired() private readonly listBookmarks!: ListBookmarksUseCase

  @Get('/', { query: pageQuerySchema, name: 'ListBookmarks' })
  async list(ctx: Ctx<KickRoutes.BookmarksController['list']>) {
    return this.listBookmarks.execute(ctx.require('auth').id, ctx.query)
  }
}
