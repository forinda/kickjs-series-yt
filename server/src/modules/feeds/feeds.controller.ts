import { Autowired, Controller, Get, HttpException, type Ctx } from '@forinda/kickjs'
import { ApiTags } from '@forinda/kickjs-swagger'
import { PublicRoute } from '@/contributors/auth.contributor'
import { FeedsService } from './feeds.service'

/** Mounted at the site root, outside /api: these URLs are what readers and crawlers expect. */
@Controller()
@ApiTags('Feeds')
@PublicRoute
export class FeedsController {
  @Autowired() private readonly feeds!: FeedsService

  @Get('/rss.xml', { name: 'RssFeed' })
  async rss(ctx: Ctx<KickRoutes.FeedsController['rss']>) {
    ctx.setHeader('Cache-Control', 'public, max-age=900')
    return ctx.send(await this.feeds.rss(), { type: 'application/rss+xml; charset=utf-8' })
  }

  @Get('/sitemap.xml', { name: 'Sitemap' })
  async sitemap(ctx: Ctx<KickRoutes.FeedsController['sitemap']>) {
    ctx.setHeader('Cache-Control', 'public, max-age=3600')
    return ctx.send(await this.feeds.sitemap(), { type: 'application/xml; charset=utf-8' })
  }

  @Get('/robots.txt', { name: 'Robots' })
  async robots(ctx: Ctx<KickRoutes.FeedsController['robots']>) {
    return ctx.send(this.feeds.robots())
  }

  /** The article page itself, with share tags in <head> (see FeedsService.articlePage). */
  @Get('/blogs/:id', { name: 'ArticlePage' })
  async article(ctx: Ctx<KickRoutes.FeedsController['article']>) {
    const page = await this.feeds.articlePage(ctx.params.id)
    if (!page) throw HttpException.notFound('No web build to serve')
    ctx.setHeader('Cache-Control', 'no-cache')
    return ctx.html(page.html, page.found ? 200 : 404)
  }
}
