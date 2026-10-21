import { Autowired, Controller, Get, HttpException, type Ctx } from '@forinda/kickjs'
import { ApiBearerAuth, ApiTags } from '@forinda/kickjs-swagger'
import { ListMyArticlesUseCase } from '../use-cases/list-my-articles.use-case'
import { GetMyArticleUseCase } from '../use-cases/get-my-article.use-case'

/** The signed-in writer's own articles, any status. Mounted at /me/articles. */
@Controller()
@ApiBearerAuth()
@ApiTags('Articles')
export class MyArticlesController {
  @Autowired() private readonly listMine!: ListMyArticlesUseCase
  @Autowired() private readonly getMine!: GetMyArticleUseCase

  @Get('/', { name: 'ListMyArticles' })
  async list(ctx: Ctx<KickRoutes.MyArticlesController['list']>) {
    return this.listMine.execute(ctx.require('auth').id)
  }

  @Get('/:id', { name: 'GetMyArticle' })
  async show(ctx: Ctx<KickRoutes.MyArticlesController['show']>) {
    const article = await this.getMine.execute(ctx.params.id, ctx.require('auth').id)
    if (!article) throw HttpException.notFound('Article not found')
    return article
  }
}
