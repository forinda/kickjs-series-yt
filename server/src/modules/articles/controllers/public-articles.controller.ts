import { Autowired, Controller, Get, HttpException, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { URL_TTL } from '@/common/media/media.service'
import { PublicRoute } from '@/contributors/auth.contributor'
import { ListPublicArticlesUseCase } from '../use-cases/list-public-articles.use-case'
import { GetPublicArticleUseCase } from '../use-cases/get-public-article.use-case'
import { GetArticleImageUrlUseCase } from '../use-cases/get-article-image-url.use-case'

/** What any visitor can read. */
@Controller()
@ApiTags('Articles')
@PublicRoute
export class PublicArticlesController {
  @Autowired() private readonly listArticles!: ListPublicArticlesUseCase
  @Autowired() private readonly getArticle!: GetPublicArticleUseCase
  @Autowired() private readonly getImageUrl!: GetArticleImageUrlUseCase

  @Get('/', { name: 'ListArticles' })
  async list(_ctx: Ctx<KickRoutes.PublicArticlesController['list']>) {
    return this.listArticles.execute()
  }

  /** Embedded article images: stable URL in the HTML, redirect to a fresh signed one. */
  @Get('/images/:file', { name: 'GetArticleImage' })
  async image(ctx: Ctx<KickRoutes.PublicArticlesController['image']>) {
    const target = await this.getImageUrl.execute(ctx.params.file)
    if (!target) throw HttpException.notFound('Image not found')
    // Let the browser reuse the redirect, but not past the signed URL's lifetime.
    ctx.setHeader('Cache-Control', `private, max-age=${target.ttl - 60}`)
    return ctx.redirect(target.url, 302)
  }

  /** Stable thumbnail URL for share cards and feeds, which can't use an expiring signed one. */
  @Get('/:id/thumbnail', { name: 'GetArticleThumbnail' })
  async thumbnail(ctx: Ctx<KickRoutes.PublicArticlesController['thumbnail']>) {
    const article = await this.getArticle.execute(ctx.params.id)
    if (!article?.thumbnail) throw HttpException.notFound('Thumbnail not found')
    ctx.setHeader('Cache-Control', `public, max-age=${URL_TTL.thumbnail - 60}`)
    return ctx.redirect(article.thumbnail, 302)
  }

  @Get('/:id', { name: 'GetArticle' })
  async show(ctx: Ctx<KickRoutes.PublicArticlesController['show']>) {
    const article = await this.getArticle.execute(ctx.params.id)
    if (!article) throw HttpException.notFound('Article not found')
    return article
  }
}
