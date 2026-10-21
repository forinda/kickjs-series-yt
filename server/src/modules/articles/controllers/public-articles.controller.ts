import { Autowired, Controller, Get, HttpException, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { ListPublicArticlesUseCase } from '../use-cases/list-public-articles.use-case'
import { GetPublicArticleUseCase } from '../use-cases/get-public-article.use-case'

/** What any visitor can read. */
@Controller()
@ApiTags('Articles')
@PublicRoute
export class PublicArticlesController {
  @Autowired() private readonly listArticles!: ListPublicArticlesUseCase
  @Autowired() private readonly getArticle!: GetPublicArticleUseCase

  @Get('/', { name: 'ListArticles' })
  async list(_ctx: Ctx<KickRoutes.PublicArticlesController['list']>) {
    return this.listArticles.execute()
  }

  @Get('/:id', { name: 'GetArticle' })
  async show(ctx: Ctx<KickRoutes.PublicArticlesController['show']>) {
    const article = await this.getArticle.execute(ctx.params.id)
    if (!article) throw HttpException.notFound('Article not found')
    return article
  }
}
